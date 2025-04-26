import React from 'react';

const HtmlPage = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!DOCTYPE html>
<html>
<head>
    <title>測試 Lambda - API Gateway</title>
</head>
<body>
    <h1>測試Lambda連接</h1>
    <button onclick="sendRequest()">送出測試資料</button>
    <div id="result"></div>

    <script>
        async function sendRequest() {
            try {
                const response = await fetch('https://kswwjftr60.execute-api.us-west-2.amazonaws.com/prod/predict', {  
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ input: "我從前端來的資料" })
                });
                const result = await response.json();
                console.log(result);
                document.getElementById('result').innerText = JSON.stringify(result);
            } catch (error) {
                console.error('錯誤發生', error);
                document.getElementById('result').innerText = '錯誤: ' + error;
            }
        }
    </script>
</body>
</html>

    ` }} />
  );
};

export default HtmlPage;
