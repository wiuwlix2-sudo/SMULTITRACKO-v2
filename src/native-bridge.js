import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { FilePicker } from '@capawesome/capacitor-file-picker';

function base64ToBlob(b64, mime = 'application/octet-stream') {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function blobToBase64(blob) {
  return await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || '').split(',')[1] || '');
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}

async function pickAndImportMTP() {
  try {
    const result = await FilePicker.pickFiles({
      multiple: true,
      types: ['*/*', 'application/octet-stream', '.mtp'],
      readData: true
    });

    if (!result?.files?.length) return;

    for (const f of result.files) {
      const name = (f.name || 'proyecto.mtp');
      const mime = f.mimeType || 'application/octet-stream';
      const data = f.data;
      if (!data) continue;

      const blob = base64ToBlob(data, mime);
      const finalName = name.toLowerCase().endsWith('.mtp') ? name : (name + '.mtp');
      const file = new File([blob], finalName, { type: mime });

      if (typeof window.importProjectMTP === 'function') {
        await window.importProjectMTP(file);
      } else {
        console.warn('importProjectMTP no está disponible');
      }
    }
  } catch (e) {
    console.warn('pickAndImportMTP falló:', e);
  }
}
async function saveBlobAndShare(blob, filename) {
  try {
    const b64 = await blobToBase64(blob);

    await Filesystem.writeFile({
      path: filename,
      data: b64,
      directory: Directory.Cache
    });

    const uri = await Filesystem.getUri({
      directory: Directory.Cache,
      path: filename
    });

    await Share.share({
      title: filename,
      text: 'Proyecto MTP',
      url: uri.uri,
      dialogTitle: 'Guardar/Compartir'
    });
  } catch (e) {
    console.warn('saveBlobAndShare falló:', e);
  }
}

window.NativeBridge = { pickAndImportMTP, saveBlobAndShare };
