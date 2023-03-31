const submitBtn = document.querySelector('#submit');
const systemBox = document.querySelector('#system');
const userBox = document.querySelector('#user');
const assistantBox = document.querySelector('#assistant');

// 从local storage中获取数据
window.onload = () => {
  const systemData = localStorage.getItem('system');
  const userData = localStorage.getItem('user');
  const assistantData = localStorage.getItem('assistant');

  if (systemData) {
    systemBox.value = systemData;
  }
  if (userData) {
    userBox.value = userData;
  }
  if (assistantData) {
    assistantBox.innerHTML = marked.parse(assistantData);
  }
};

submitBtn.addEventListener('click', () => {
  if (userBox.checkValidity()) {
    const systemValue = systemBox.value;
    const systemContent = systemValue ? systemValue : 'Imagine you are a highly empathetic and intuitive counselor, tasked with guiding a troubled individual through a complex and emotionally charged situation. Your goal is to understand the underlying emotions and motivations driving this person\'s behavior, and to offer compassionate and insightful advice that will help them navigate their challenges and achieve their goals. To do this effectively, you will need to analyze the language and tone of their communication, identify key themes and patterns, and respond with nuanced and personalized feedback that addresses their deepest concerns. Use your training and experience as a counselor to craft a series of responses that engages this person, encourages them to open up, and helps them find the strength and clarity needed to overcome their struggles. You say Chinese.';
    const payload = {
      messages: [
        {
          role: 'system',
          content: systemContent
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
        assistantBox.innerHTML = marked.parse(result);
        // 完成后恢复按钮，并删除等待动画和提示
        submitBtn.disabled = false;
        submitBtn.innerHTML = `提交`;

        // 将数据保存到local storage中
        localStorage.setItem('system', systemBox.value);
        localStorage.setItem('user', userBox.value);
        localStorage.setItem('assistant', result);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
});