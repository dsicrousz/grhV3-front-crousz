import { env } from "@/env";
import axios from "axios";
import { message } from "antd";

const Api = axios.create({
  baseURL: env.VITE_APP_BACKEND,
  withCredentials: true,
});

Api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response?.status === 440) {
      localStorage.removeItem(env.VITE_APP_TOKENSTORAGENAME);
      window.location.pathname = "/";
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const data = error.response?.data;

    let msg: string;
    if (data?.message) {
      msg = data.message;
    } else if (error.code === "ERR_NETWORK") {
      msg = "Erreur réseau : impossible de contacter le serveur";
    } else if (error.code === "ECONNABORTED") {
      msg = "La requête a expiré";
    } else {
      msg = "Une erreur inattendue s'est produite";
    }

    if (status === 401) {
      message.warning(msg);
    } else if (status === 403) {
      message.warning(msg);
    } else if (status && status >= 500) {
      message.error(msg);
    } else if (status && status >= 400) {
      message.warning(msg);
    } else {
      message.error(msg);
    }

    return Promise.reject(error);
  },
);

export default Api;