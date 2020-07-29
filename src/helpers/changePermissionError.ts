const changePermissionError = (e: Error) => {
  const errCode = (e as any).code;
  if (errCode && errCode === 4100) {
    e.message = "Unauthorized to perform action. Try requesting permission first using the `requestPermissions` method. More information available at https://eips.ethereum.org/EIPS/eip-2255"
  }
  return e;
};

export default changePermissionError;
