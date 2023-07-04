const submitBtn = document.querySelector('#submit');
const systemBox = document.querySelector('#system');
const userBox = document.querySelector('#user');
const assistantBox = document.querySelector('#assistant');
const subtitle = document.querySelector('.subtitle');

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

    const response = await fetch('https://ai.fakeopen.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer pk-this-is-a-real-free-pool-token-for-everyone'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const reader = response.body.getReader();
      const textDecoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = textDecoder.decode(value);
        result += chunk;
      }

      const json = JSON.parse(result);
      const assistantResult = json.choices[0].text;
      assistantBox.innerHTML = marked.parse(assistantResult);

      // Enable the button and remove the waiting animation and hint after completion
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Submit`;

      // Save the data to local storage
      localStorage.setItem('system', systemBox.value);
      localStorage.setItem('user', userBox.value);
      localStorage.setItem('assistant', assistantResult);
    } else {
      console.error('Error:', response.status);
    }
  }
});

subtitle.addEventListener('click', () => {
  // 发送GET请求
  fetch('https://api.aigcfun.com/fc/verify-key?key=FCF3CF2371018C3BD8')
    .then(response => response.json())
    .then(data => {
      // 判断errCode是否为0
      if (data.errCode === 0) {
        // 获取剩余次数
        const remain = data.data.remain;
        // 弹出提示框
        alert(`API剩余调用次数为${remain}次`);
      } else {
        alert('API调用失败');
      }
    })
    .catch(error => console.error(error));
});
