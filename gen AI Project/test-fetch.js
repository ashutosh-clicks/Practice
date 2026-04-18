fetch("http://localhost:3000/api/upload", { method: "POST" })
  .then(res => "ok: " + res.ok + ", status: " + res.status + ", text: " + res.text().then(console.log))
  .catch(console.error);
