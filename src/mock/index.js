import { createServer } from "miragejs";
import { API_BASE_URL } from "configs/AppConfig";

import { signInUserData } from "./data/authData";

import { authFakeApi } from "./fakeApi";

export default function mockServer({ environment = "test" }) {
 
    // return createServer({
    //   environment,
     
    //   seeds(server) {
    //     if (environment === 'test') {
    //         server.db.loadData({
    //             signInUserData
    //         })
    //     }
       
    //   },
    //   routes() {
    //     this.urlPrefix = "";
    //     this.namespace = "";
    //     this.passthrough((request) => {
    //       const isExternal = request.url.startsWith("http");
    //       return isExternal;
    //     });
    //     this.passthrough();

    //     if (environment === 'test') {
    //         authFakeApi(this, API_BASE_URL)
    //     }
    //   },
    // });
  }

