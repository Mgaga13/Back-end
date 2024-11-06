import axios from 'axios';

export const removeUndefined = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] == null || obj[k] == undefined || obj[k] === '') delete obj[k];
  });
  return obj;
};

export const validateInputData = (data) => {
  if (data === undefined || data === null || data === '') {
    return false;
  }
  return true;
};

export const fetchBufferImg = async (url) => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    const buffer = Buffer.from(response.data, 'base64');
    return buffer;
  } catch (error) {
    console.log('------ error fetching image data ------', url);
  }
};

export const formatName = (name: string) => {
  // Crown Chakra -> crown-chakra
  const str = name.toLowerCase().trim();
  const arr = str.split(' ');
  return arr.join('-');
};
