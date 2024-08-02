export const formatResponse = (response) => {
  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  let formattedResponse = response
    .replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: 550;">$1</span>')
    .replace(/##(.*?)\n/g, "<h3>$1</h3>")
    .replace(/^\*(.*?)$/gm, "<ul><li>$1</li></ul>")
    .replace(
      /```(\w+)\n([\s\S]*?)```/g,
      (match, lang, code) =>
        `<pre class="code-block"><div class="code-header"><span class="code-lang">${lang}</span></div><code>${escapeHtml(
          code
        )}</code></pre>`
    )
    .replace(
      /```\n([\s\S]*?)```/g,
      (match, code) =>
        `<pre class="code-block"><code>${escapeHtml(code)}</code></pre>`
    )
    .replace(
      /`([^`]+)`/g,
      (match, code) => `<code class="inline-code">${escapeHtml(code)}</code>`
    )
    .replace(/\n/g, "</br>");

  formattedResponse = formattedResponse.replace(/<\/ul>\n<ul>/g, "");

  return formattedResponse;
};
