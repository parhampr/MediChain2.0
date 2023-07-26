export const getReadableDate = (date) => {
  const parsedDate = new Date(date);
  return `${parsedDate.toLocaleString("default", {
    month: "long",
  })} ${parsedDate.getDate()}, ${parsedDate.getFullYear()}`;
};
