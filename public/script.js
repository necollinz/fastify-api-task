const btn = document.getElementById('btn');

btn.addEventListener('click', async () => {
  const response = await fetch('/api');
  const data = await response.json();

  console.log(data.message);
});