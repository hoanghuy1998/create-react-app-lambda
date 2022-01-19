import api from "./api";
const getByQuery = (s) =>
  api.get(`${api.url.productDescription}/filter?search=${s}`);
const productDescription = {
  getByQuery,
};
export default productDescription;
