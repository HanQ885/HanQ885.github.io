(() => {
  'use strict';

  const screen = document.getElementById('screen');
  const actions = document.getElementById('actions');
  const message = document.getElementById('message');
  const progressWrap = document.getElementById('progressWrap');
  const progressText = document.getElementById('progressText');
  const stepTitle = document.getElementById('stepTitle');
  const progressBar = document.getElementById('progressBar');

  const totalSurveySteps = 7;
  const completeStep = 8;
  const normalSeats = ['A', 'B', 'C', 'D', 'E'].flatMap((row) => [1, 2, 3, 4, 5].map((col) => `${row}${col}`));
  const groups = [
    ['G1', '앞쪽 왼쪽 모둠'],
    ['G2', '앞쪽 오른쪽 모둠'],
    ['G3', '중간 왼쪽 모둠'],
    ['G4', '중간 오른쪽 모둠'],
    ['G5', '뒤쪽 왼쪽 모둠'],
    ['G6', '뒤쪽 오른쪽 모둠'],
  ];
  const groupSeats = groups.flatMap(([group]) => [1, 2, 3, 4].map((seat) => `${group}-${seat}`));
  const titles = ['', '개인정보 동의', '기본 정보', '일반 교실 선호', '일반 교실 기피', '모둠수업 선호', '모둠수업 기피', '수업 집중도'];

  let step = 0;
  let sending = false;
  const state = initialState();

  window.getSeatSurveyPayload = payload;
  window.validateSeatSurveyBeforeSubmit = () => validate();
  window.showSeatSurveyComplete = showComplete;

  injectGradeButtonStyles();
  render();

  function initialState() {
    return {
      privacyConsent: null,
      affiliation: '',
      name: '',
      grade: '',
      phone: '',
      phoneNormalized: '',
      normalPrefer: [],
      normalAvoid: [],
      groupPrefer: [],
      groupAvoid: [],
      focusScore: '',
    };
  }

  function render() {
    message.textContent = '';
    const showProgress = step > 0 && step <= totalSurveySteps;
    progressWrap.classList.toggle('hidden', !showProgress);
    if (showProgress) {
      progressText.textContent = `${step} / ${totalSurveySteps}`;
      stepTitle.textContent = titles[step];
      progressBar.style.width = `${Math.min(100, step / totalSurveySteps * 100)}%`;
    }
    screen.replaceChildren(view());
    actions.replaceChildren(...navButtons());
  }

  function view() {
    if (step === 0) return startView();
    if (step === 1) return privacyView();
    if (step === 2) return basicView();
    if (step === 3) return seatView('normalPrefer', normalSeats, 'normal', '일반 교실 5×5 구조에서 가장 앉고 싶은 자리를 순서대로 3개 선택해주세요.');
    if (step === 4) return seatView('normalAvoid', normalSeats, 'normal', '일반 교실 5×5 구조에서 가장 앉고 싶지 않은 자리를 순서대로 3개 선택해주세요.');
    if (step === 5) return seatView('groupPrefer', groupSeats, 'group', '모둠수업 형태에서 가장 앉고 싶은 자리를 순서대로 3개 선택해주세요.');
    if (step === 6) return seatView('groupAvoid', groupSeats, 'group', '모둠수업 형태에서 가장 앉고 싶지 않은 자리를 순서대로 3개 선택해주세요.');
    if (step === 7) return focusView();
    return completeView();
  }

  function navButtons() {
    if (step === 0) return [button('설문 시작하기', 'primary', () => go(1))];
    if (step === completeStep) return [button('처음으로 돌아가기', 'primary', resetAll)];
    if (step === totalSurveySteps) return [
      button('이전', 'secondary', () => go(step - 1)),
      button(sending ? '제출 중...' : '제출하기', 'primary', submit, sending),
    ];
    return [
      button('이전', 'secondary', () => go(step - 1)),
      button('다음', 'primary', next),
    ];
  }

  function go(nextStep) {
    step = nextStep;
    render();
  }

  function next() {
    if (!validate()) return;
    go(step + 1);
  }

  function startView() {
    const box = el('div');
    box.innerHTML = `<p class='eyebrow'>제28회 전국학생통계활용대회</p><h1>교실에도 명당이 있을까?</h1><p class='lead'>좌석 위치와 수업 집중도에 관한 설문</p><p class='notice'>본 설문은 제28회 전국학생통계활용대회 출품작 연구를 위한 설문입니다. 응답 내용은 좌석 위치와 수업 집중도에 대한 통계 분석 및 통계포스터 제작 목적으로 사용됩니다. 설문 소요 시간은 약 1분입니다.</p>`;
    return box;
  }

  function privacyView() {
    const box = el('div');
    box.innerHTML = `<h2>개인정보 수집 및 이용 동의</h2><p class='notice'>본 설문조사는 ‘제28회 전국학생통계활용대회’ 출품작 연구를 목적으로 진행됩니다. 응답해주신 내용은 통계 분석 목적으로만 사용되며, 대회 종료 및 결과 발표 후 파기됩니다.\n\n수집 항목: 이름, 학년, 소속, 전화번호, 좌석 선호 및 기피 응답, 수업 집중도 응답\n\n수집 목적: 전국학생통계활용대회 참가를 위한 데이터 수집, 중복 응답 확인, 상품 지급 및 연락\n\n보유 기간: 대회 종료 및 결과 발표 시까지\n\n※ 귀하는 본 동의를 거부할 권리가 있으며, 거부 시 설문 참여가 제한될 수 있습니다.</p><p class='question'>개인정보 수집 및 이용에 동의하십니까?</p>`;
    box.append(choices('privacyConsent', [
      ['agree', '동의합니다', true],
      ['disagree', '동의하지 않습니다', false],
    ], (value) => {
      state.privacyConsent = value === 'agree';
      if (!state.privacyConsent) fail('개인정보 수집 및 이용에 동의해야 설문에 참여할 수 있습니다.');
    }, state.privacyConsent === true ? 'agree' : state.privacyConsent === false ? 'disagree' : ''));
    return box;
  }

  function basicView() {
    const box = el('div');
    box.innerHTML = `<h2>기본 정보 입력</h2>`;
    const grid = el('div', 'field-grid two');
    grid.append(textField('affiliation', '소속', '소속을 입력해주세요.', '예: 경기고등학교'));
    grid.append(textField('name', '이름', '이름을 입력해주세요.', '예: 홍길동'));
    grid.append(gradeButtonsField());
    grid.append(textField('phone', '전화번호', '전화번호를 입력해주세요.', '010-1234-5678', 'tel', '상품 지급 및 중복 응답 확인 목적으로만 사용됩니다.'));
    box.append(grid);
    return box;
  }

  function seatView(key, seats, type, question) {
    const box = el('div');
    const desc = type === 'normal'
      ? '실제 교실 구조가 5×5와 완전히 다르더라도, 본인이 생각하는 위치와 가장 가까운 칸을 선택해주세요. A줄은 칠판에 가장 가까운 앞줄, E줄은 가장 뒷줄입니다. 1번은 창가 쪽, 5번은 복도/문 쪽입니다.'
      : '모둠의 위치와 모둠 안의 번호를 함께 고려해 선택해주세요. 각 모둠 안의 좌석은 1, 2, 3, 4로 표시됩니다.';
    box.innerHTML = `<h2>좌석 선택</h2><p class='question'>${question}</p><p class='seat-help'>${desc}</p>`;
    box.append(rankChips(state[key]));
    box.append(type === 'normal' ? normalClassroom(key, seats) : groupClassroom(key));
    box.append(button('선택 초기화', 'warning', () => { state[key] = []; render(); }));
    return box;
  }

  function rankChips(selected) {
    const wrap = el('div', 'selection-status');
    wrap.setAttribute('aria-label', '선택한 좌석 순위');
    [0, 1, 2].forEach((idx) => wrap.append(el('span', `rank-chip ${selected[idx] ? 'filled' : ''}`, selected[idx] ? `${idx + 1}순위 ${selected[idx]}` : `${idx + 1}순위 미선택`)));
    return wrap;
  }

  function normalClassroom(key, seats) {
    const room = el('div', 'classroom');
    room.append(el('div', 'board', '칠판 / 선생님'));
    const wrap = el('div', 'seat-map-wrap');
    wrap.append(el('div', 'side-label', '창가 쪽'));
    const grid = el('div', 'seat-grid normal-grid');
    seats.forEach((seat) => grid.append(seatButton(key, seat, seat, `일반 교실 좌석 ${seat}`)));
    wrap.append(grid);
    wrap.append(el('div', 'side-label', '복도 / 문 쪽'));
    room.append(wrap);
    return room;
  }

  function groupClassroom(key) {
    const room = el('div', 'classroom');
    room.append(el('div', 'board', '칠판'));
    room.append(el('div', 'teacher-desk', '교사 책상'));
    const wrap = el('div', 'seat-map-wrap');
    wrap.append(el('div', 'side-label', '창문 쪽'));
    const grid = el('div', 'seat-grid group-grid');
    groups.forEach(([group, label]) => {
      const box = el('div', 'group-box');
      box.append(el('div', 'group-title', `${group} ${label}`));
      const seats = el('div', 'group-seats');
      [1, 2, 3, 4].forEach((seatNo) => seats.append(seatButton(key, String(seatNo), `${group}-${seatNo}`, `${group}-${seatNo}, ${label} ${seatNo}번 좌석`)));
      box.append(seats);
      grid.append(box);
    });
    wrap.append(grid);
    wrap.append(el('div', 'side-label', '문 / 복도 쪽'));
    room.append(wrap);
    return room;
  }

  function seatButton(key, label, value, aria) {
    const selected = state[key];
    const rank = selected.indexOf(value);
    const btn = el('button', `seat-button ${rank >= 0 ? 'selected' : ''}`, label);
    btn.type = 'button';
    btn.setAttribute('aria-label', `${aria}${rank >= 0 ? `, ${rank + 1}순위 선택됨` : ''}`);
    if (rank >= 0) btn.append(el('span', 'seat-rank', String(rank + 1)));
    btn.addEventListener('click', () => toggleSeat(key, value));
    return btn;
  }

  function toggleSeat(key, value) {
    const selected = state[key];
    const found = selected.indexOf(value);
    if (found >= 0) {
      selected.splice(found, 1);
      render();
      return;
    }
    if (selected.length >= 3) {
      fail('최대 3개까지 선택할 수 있습니다.');
      return;
    }
    selected.push(value);
    render();
  }

  function focusView() {
    const box = el('div');
    box.innerHTML = `<h2>자신의 수업 집중도</h2><p class='question'>평소 자신의 수업 집중도는 어느 정도라고 생각하나요?</p>`;
    box.append(choices('focusScore', [
      ['1', '1점: 매우 낮음'], ['2', '2점: 낮음'], ['3', '3점: 보통'], ['4', '4점: 높음'], ['5', '5점: 매우 높음'],
    ], (value) => { state.focusScore = value; }, state.focusScore, 'score-grid'));
    return box;
  }

  function completeView() {
    const box = el('div', 'complete');
    box.innerHTML = `<div class='complete-mark' aria-hidden='true'>✓</div><h2>응답이 저장되었습니다.</h2><p class='lead'>설문에 참여해주셔서 감사합니다.</p>`;
    return box;
  }

  function validate() {
    if (step === 1 && state.privacyConsent !== true) return fail('개인정보 수집 및 이용에 동의해야 설문에 참여할 수 있습니다.');
    if (step === 2) {
      state.affiliation = state.affiliation.trim();
      state.name = state.name.trim();
      state.phone = state.phone.trim();
      state.phoneNormalized = normalizePhone(state.phone);
      if (!state.affiliation) return fail('소속을 입력해주세요.');
      if (!state.name) return fail('이름을 입력해주세요.');
      if (!state.grade) return fail('학년을 선택해주세요.');
      if (!state.phone) return fail('전화번호를 입력해주세요.');
      if (!/^[0-9 -]+$/.test(state.phone)) return fail('전화번호는 숫자, 하이픈, 공백만 입력할 수 있습니다.');
      if (state.phoneNormalized.length < 10) return fail('전화번호 숫자는 10자리 이상 입력해주세요.');
    }
    const seatKeys = { 3: 'normalPrefer', 4: 'normalAvoid', 5: 'groupPrefer', 6: 'groupAvoid' };
    if (seatKeys[step] && state[seatKeys[step]].length !== 3) return fail('정확히 3개를 선택해야 다음 단계로 갈 수 있습니다.');
    if (step === 7 && !state.focusScore) return fail('수업 집중도를 선택해주세요.');
    return true;
  }

  async function submit() {
    if (!validate()) return;
    const url = typeof SCRIPT_URL === 'string' ? SCRIPT_URL.trim() : '';
    if (!url) return fail('관리자 설정이 완료되지 않았습니다. SCRIPT_URL을 설정해주세요.');
    sending = true;
    render();
    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload()),
      });
      const text = await response.text();
      let result = null;
      try { result = text ? JSON.parse(text) : null; } catch (error) { result = null; }
      if (result && result.duplicate) return fail('이미 제출된 전화번호입니다. 중복 응답은 제출할 수 없습니다.');
      if (!response.ok || (result && result.ok === false)) return fail('응답 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      showComplete();
    } catch (error) {
      fail('응답 저장 중 문제가 발생했습니다. 네트워크 상태 또는 SCRIPT_URL 설정을 확인해주세요.');
    } finally {
      sending = false;
      if (step === totalSurveySteps) {
        const currentMessage = message.textContent;
        render();
        if (currentMessage) fail(currentMessage);
      }
    }
  }

  function showComplete() {
    Object.assign(state, initialState());
    step = completeStep;
    render();
  }

  function payload() {
    return {
      submittedAtClient: new Date().toISOString(),
      privacyConsent: true,
      affiliation: state.affiliation,
      name: state.name,
      grade: state.grade,
      phone: state.phone,
      phoneNormalized: state.phoneNormalized,
      normalPrefer1: state.normalPrefer[0],
      normalPrefer2: state.normalPrefer[1],
      normalPrefer3: state.normalPrefer[2],
      normalAvoid1: state.normalAvoid[0],
      normalAvoid2: state.normalAvoid[1],
      normalAvoid3: state.normalAvoid[2],
      groupPrefer1: state.groupPrefer[0],
      groupPrefer2: state.groupPrefer[1],
      groupPrefer3: state.groupPrefer[2],
      groupAvoid1: state.groupAvoid[0],
      groupAvoid2: state.groupAvoid[1],
      groupAvoid3: state.groupAvoid[2],
      focusScore: Number(state.focusScore),
      userAgent: navigator.userAgent,
    };
  }

  function gradeButtonsField() {
    const field = el('div', 'field grade-field');
    field.append(labelFor('grade-choice-1', '학년'));
    field.append(el('p', 'hint', '학년을 선택해주세요.'));

    const row = el('div', 'grade-button-row');
    ['1학년', '2학년', '3학년'].forEach((value, index) => {
      const selected = state.grade === value;
      const gradeButton = button(value, `${selected ? 'primary' : 'secondary'} grade-choice`, () => {
        state.grade = value;
        message.textContent = '';
        row.querySelectorAll('.grade-choice').forEach((buttonNode) => {
          const active = buttonNode.dataset.gradeValue === value;
          buttonNode.classList.toggle('primary', active);
          buttonNode.classList.toggle('secondary', !active);
          buttonNode.setAttribute('aria-pressed', String(active));
        });
      });
      gradeButton.id = `grade-choice-${index + 1}`;
      gradeButton.dataset.gradeValue = value;
      gradeButton.setAttribute('aria-pressed', String(selected));
      row.append(gradeButton);
    });

    field.append(row);
    return field;
  }

  function textField(id, label, question, placeholder, type = 'text', hint = '') {
    const field = el('div', 'field');
    field.append(labelFor(id, label));
    field.append(el('p', 'hint', question));
    if (hint) field.append(el('p', 'hint', hint));
    const input = el('input');
    input.id = id;
    input.name = id;
    input.type = type;
    input.placeholder = placeholder;
    input.required = true;
    input.autocomplete = 'off';
    input.value = state[id];
    input.addEventListener('input', () => {
      state[id] = id === 'name' || id === 'affiliation' ? input.value.trimStart() : input.value;
      if (id === 'phone') state.phoneNormalized = normalizePhone(input.value);
    });
    field.append(input);
    return field;
  }

  function choices(name, items, onChange, current, cls = 'choice-stack') {
    const wrap = el('div', cls);
    items.forEach(([value, label]) => {
      const item = el('label', 'choice');
      const input = el('input');
      input.type = 'radio';
      input.name = name;
      input.value = value;
      input.checked = current === value;
      input.addEventListener('change', () => onChange(value));
      item.append(input);
      item.append(el('span', '', label));
      wrap.append(item);
    });
    return wrap;
  }

  function labelFor(id, text) {
    const label = el('label', '', text);
    label.setAttribute('for', id);
    return label;
  }

  function button(text, variant, onClick, disabled = false) {
    const btn = el('button', `btn ${variant}`, text);
    btn.type = 'button';
    btn.disabled = disabled;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function el(tag, className = '', text = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== '') node.textContent = text;
    return node;
  }

  function normalizePhone(value) {
    return String(value || '').replace(/[^0-9]/g, '');
  }

  function fail(text) {
    message.textContent = text;
    return false;
  }

  function resetAll() {
    Object.assign(state, initialState());
    go(0);
  }

  function injectGradeButtonStyles() {
    if (document.getElementById('grade-button-styles')) return;

    const style = document.createElement('style');
    style.id = 'grade-button-styles';
    style.textContent = `
      .grade-button-row {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }

      .grade-choice {
        width: 100%;
        min-height: 50px;
      }

      .grade-choice[aria-pressed="true"] {
        border-color: var(--primary-dark);
      }

      @media (max-width: 420px) {
        .grade-button-row {
          gap: 6px;
        }

        .grade-choice {
          min-height: 48px;
          padding-inline: 8px;
        }
      }
    `;
    document.head.append(style);
  }
})();
