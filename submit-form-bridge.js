(() => {
  'use strict';

  document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button || button.textContent.trim() !== '제출하기') return;

    const canUseBridge = document.querySelector('.summary-table') || typeof window.getSeatSurveyPayload === 'function';
    if (!canUseBridge) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (typeof window.validateSeatSurveyBeforeSubmit === 'function' && !window.validateSeatSurveyBeforeSubmit()) {
      return;
    }

    submitWithFormBridge(button);
  }, true);

  async function submitWithFormBridge(button) {
    const message = document.getElementById('message');
    const scriptUrl = typeof SCRIPT_URL === 'string' ? SCRIPT_URL.trim() : '';

    if (!scriptUrl) {
      message.textContent = '관리자 설정이 완료되지 않았습니다. SCRIPT_URL을 설정해주세요.';
      return;
    }

    button.disabled = true;
    button.textContent = '제출 중...';
    message.textContent = '';

    try {
      await postForm(scriptUrl, buildPayload());
      if (typeof window.showSeatSurveyComplete === 'function') {
        window.showSeatSurveyComplete();
      } else {
        showCompleteScreen();
      }
    } catch (error) {
      button.disabled = false;
      button.textContent = '제출하기';
      message.textContent = '응답 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  }

  function buildPayload() {
    if (typeof window.getSeatSurveyPayload === 'function') {
      return window.getSeatSurveyPayload();
    }
    return buildPayloadFromSummary();
  }

  function buildPayloadFromSummary() {
    const rows = Array.from(document.querySelectorAll('.summary-table tr'));
    const summary = {};

    rows.forEach((row) => {
      const key = row.querySelector('th')?.textContent.trim();
      const value = row.querySelector('td')?.textContent.trim() || '';
      if (key) summary[key] = value;
    });

    const normalPrefer = splitRanks(summary['일반 교실 앉고 싶은 자리 1~3순위']);
    const normalAvoid = splitRanks(summary['일반 교실 앉고 싶지 않은 자리 1~3순위']);
    const groupPrefer = splitRanks(summary['모둠수업 앉고 싶은 자리 1~3순위']);
    const groupAvoid = splitRanks(summary['모둠수업 앉고 싶지 않은 자리 1~3순위']);
    const phone = summary['전화번호'] || '';

    return {
      submittedAtClient: new Date().toISOString(),
      privacyConsent: true,
      affiliation: summary['소속'] || '',
      name: summary['이름'] || '',
      grade: summary['학년'] || '',
      phone,
      phoneNormalized: phone.replace(/[^0-9]/g, ''),
      normalPrefer1: normalPrefer[0] || '',
      normalPrefer2: normalPrefer[1] || '',
      normalPrefer3: normalPrefer[2] || '',
      normalAvoid1: normalAvoid[0] || '',
      normalAvoid2: normalAvoid[1] || '',
      normalAvoid3: normalAvoid[2] || '',
      groupPrefer1: groupPrefer[0] || '',
      groupPrefer2: groupPrefer[1] || '',
      groupPrefer3: groupPrefer[2] || '',
      groupAvoid1: groupAvoid[0] || '',
      groupAvoid2: groupAvoid[1] || '',
      groupAvoid3: groupAvoid[2] || '',
      focusScore: Number((summary['자신의 수업 집중도'] || '').replace(/[^0-9]/g, '')),
      userAgent: navigator.userAgent,
    };
  }

  function splitRanks(value) {
    return String(value || '').split('>').map((item) => item.trim()).filter(Boolean);
  }

  function postForm(url, data) {
    return new Promise((resolve) => {
      const frameName = `survey_submit_${Date.now()}`;
      const iframe = document.createElement('iframe');
      iframe.name = frameName;
      iframe.style.display = 'none';

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      form.target = frameName;
      form.style.display = 'none';

      Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value ?? '');
        form.append(input);
      });

      const cleanup = () => {
        setTimeout(() => {
          form.remove();
          iframe.remove();
        }, 500);
      };

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        cleanup();
        resolve();
      };

      iframe.addEventListener('load', finish);
      document.body.append(iframe, form);
      form.submit();
      setTimeout(finish, 4500);
    });
  }

  function showCompleteScreen() {
    const progressWrap = document.getElementById('progressWrap');
    const screen = document.getElementById('screen');
    const actions = document.getElementById('actions');
    const message = document.getElementById('message');

    progressWrap.classList.add('hidden');
    message.textContent = '';
    screen.innerHTML = `<div class="complete"><div class="complete-mark" aria-hidden="true">✓</div><h2>응답이 저장되었습니다.</h2><p class="lead">설문에 참여해주셔서 감사합니다.</p></div>`;
    actions.innerHTML = '';

    const homeButton = document.createElement('button');
    homeButton.type = 'button';
    homeButton.className = 'btn primary';
    homeButton.textContent = '처음으로 돌아가기';
    homeButton.addEventListener('click', () => window.location.href = window.location.pathname + '?v=' + Date.now());
    actions.append(homeButton);
  }
})();
