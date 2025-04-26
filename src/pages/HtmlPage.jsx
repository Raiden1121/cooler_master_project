import React from 'react';

const HtmlPage = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: `
      <!DOCTYPE html>
<html>
<head>
    <title>���� Lambda - API Gateway</title>
</head>
<body>
    <h1>����Lambda�s��</h1>
    <button onclick="sendRequest()">�e�X���ո��</button>
    <div id="result"></div>

    <script>
        async function sendRequest() {
            try {
                const response = await fetch('https://kswwjftr60.execute-api.us-west-2.amazonaws.com/prod/predict', {  
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ input: "�ڱq�e�ݨӪ����" })
                });
                const result = await response.json();
                console.log(result);
                document.getElementById('result').innerText = JSON.stringify(result);
            } catch (error) {
                console.error('���~�o��', error);
                document.getElementById('result').innerText = '���~: ' + error;
            }
        }
    </script>
</body>
</html>

    ` }} />
  );
};

export default HtmlPage;
