const submitBtn = document.querySelector('#submit');
const userBox = document.querySelector('#user');
const assistantBox = document.querySelector('#assistant');

// 从local storage中获取数据
window.onload = () => {
  const systemData = localStorage.getItem('system');
  const userData = localStorage.getItem('user');
  const assistantData = localStorage.getItem('assistant');

  if (systemData && userData && assistantData) {
    document.querySelector('#system').value = systemData;
    userBox.value = userData;
    assistantBox.value = assistantData;
  }
};

submitBtn.addEventListener('click', () => {
  if (userBox.checkValidity()) {
    const payload = {
      messages: [
        {
          role: 'system',
          content: document.querySelector('#system').value
        },
        {
          role: 'user',
          content: userBox.value
        }
      ],
      model: 'gpt-3.5-turbo'
    };
    // 禁用按钮，并显示等待动画
    submitBtn.disabled = true;
    submitBtn.innerHTML = `思考中...`;

    fetch('https://api.aigcfun.com/api/v1/text?key=FCF3CF2371018C3BD8', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(json => {
        const result = json.choices[0].text;
        assistantBox.value = result;
        // 完成后恢复按钮，并删除等待动画和提示
        submitBtn.disabled = false;
        submitBtn.innerHTML = `提交`;

        // 将数据保存到local storage中
        localStorage.setItem('system', document.querySelector('#system').value);
        localStorage.setItem('user', userBox.value);
        localStorage.setItem('assistant', result);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
});