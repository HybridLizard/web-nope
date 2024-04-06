let listenersAdded = false;

function addListeners() {
  if (listenersAdded) return;
  listenersAdded = true;

  document.addEventListener('contextmenu', handleContextMenu);
}

function removeListeners() {
  if (!listenersAdded) return;
  listenersAdded = false;

  document.removeEventListener('contextmenu', handleContextMenu);
}

function handleContextMenu(event) {
  const element = event.target;
  if (element.tagName === 'IMG') {
    const imageUrl = element.src;
    if (imageUrl.endsWith('.webp')) {
      event.preventDefault();
      createContextMenu(event.pageX, event.pageY, imageUrl);
    }
  }
}

function createContextMenu(x, y, imageUrl) {
  const previousMenu = document.querySelector('.web-nope-menu');
  if(previousMenu) {
    previousMenu.remove();
  }

  const previousMenuStyle = document.querySelector('.web-nope-menu-style');
  if(previousMenuStyle) {
    previousMenuStyle.remove();
  }

  const style = document.createElement('style');
  style.classList.add('web-nope-menu-style');
  style.textContent = `
    .web-nope-menu {
      overflow: hidden;
      border: 1px solid #000;
      border-radius: 0.25rem;
    }
    .web-nope-menu-item {
      display: block;
      padding: 0.5rem 1rem;
      background: #f5f5f5;
      color: #333;
      font-size: 1rem;
      text-decoration: none;
      cursor: pointer;
    }
    .web-nope-menu-item:hover {
      background: #fff;
      color: blue;
    }
  `;
  document.body.appendChild(style);


  const menu = document.createElement('div');
  menu.classList.add('web-nope-menu');
  menu.innerHTML = `<div class="web-nope-menu-item" id="convertToJPG">⬇️ Download WEBP as JPG</div>
                    <div class="web-nope-menu-item" id="convertToPNG">⬇️ Download WEBP as PNG</div>`;
  menu.style.position = 'absolute';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.style.zIndex = '10000';
  document.body.appendChild(menu);

  menu.querySelector('#convertToJPG').addEventListener('click', () => convertImage(imageUrl, 'jpeg'));
  menu.querySelector('#convertToPNG').addEventListener('click', () => convertImage(imageUrl, 'png'));

  const removeMenu = () => {
    document.body.removeChild(menu);
    document.removeEventListener('click', removeMenu);
  };

  document.addEventListener('click', removeMenu);
}

function convertImage(imageSrc, format) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = this.naturalWidth;
    canvas.height = this.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(this, 0, 0);

    canvas.toBlob(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `converted_image.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, `image/${format}`);
  };
  img.onerror = function() {
    console.error('Image could not be loaded.');
  };
  img.src = imageSrc;
}


chrome.storage.local.get('enabled', (data) => {
  if (data.enabled) {
    addListeners();
  } else {
    removeListeners();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle") {
    if (request.enabled) {
      addListeners();
    } else {
      removeListeners();
    }
  }
});
