document.getElementById('fileInput').addEventListener('change', handleFiles);

function handleFiles(event) {
  const files = event.target.files;
  const filesArea = document.getElementById('filesArea');
  filesArea.innerHTML = '';

  const adminBase = document.getElementById('adminName').value.trim();
  const asoyBase = document.getElementById('asoyName').value.trim();
  const memberBase = document.getElementById('memberName').value.trim();

  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const lines = e.target.result.split('\n').map(line => line.trim());
      const container = document.createElement('div');
      container.classList.add('file-container');

      const label = document.createElement('label');
      label.textContent = `Nama file hasil untuk "${file.name}":`;

      const fileNameInput = document.createElement('input');
      fileNameInput.type = 'text';
      fileNameInput.value = file.name.replace('.txt', '');

      const textArea = document.createElement('textarea');
      textArea.value = lines.join('\n');

      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Download VCF';
      downloadBtn.onclick = function() {
        const editedLines = textArea.value.split('\n').map(line => line.trim()).filter(line => line !== '');
        let admin = '', asoy = [], member = [];
        let passedEmpty = false;

        for (let i = 0; i < editedLines.length; i++) {
          const line = editedLines[i];
          if (line === '') continue;
          if (!admin) {
            admin = line;
          } else {
            if (passedEmpty) {
              member.push(line);
            } else {
              asoy.push(line);
            }
          }
          if (editedLines[i] === '') passedEmpty = true;
        }

        // fallback nama jika kosong
        const finalAdmin = adminBase || `${file.name.replace('.txt', '')}`;
        const finalAsoy = asoyBase || `${file.name.replace('.txt', '')}`;
        const finalMember = memberBase || `${file.name.replace('.txt', '')}`;

        const vcfContent = [];

        // Admin
        vcfContent.push(generateVCF(`ADMIN 1 - ${finalAdmin}`, formatNumber(admin)));

        // Asoy
        asoy.forEach((num, i) => {
          vcfContent.push(generateVCF(`ASOY ${i+1} - ${finalAsoy}`, formatNumber(num)));
        });

        // Member
        member.forEach((num, i) => {
          vcfContent.push(generateVCF(`MEMBER ${i+1} - ${finalMember}`, formatNumber(num)));
        });

        const blob = new Blob([vcfContent.join('\n')], { type: 'text/vcard' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${fileNameInput.value}.vcf`;
        a.click();
      };

      container.appendChild(label);
      container.appendChild(fileNameInput);
      container.appendChild(textArea);
      container.appendChild(downloadBtn);
      filesArea.appendChild(container);
    };
    reader.readAsText(file);
  });
}

function formatNumber(num) {
  if (!num.startsWith('+')) {
    return '+' + num.replace(/\D/g, '');
  }
  return num;
}

function generateVCF(name, number) {
  return `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;TYPE=CELL:${number}
END:VCARD`;
}
