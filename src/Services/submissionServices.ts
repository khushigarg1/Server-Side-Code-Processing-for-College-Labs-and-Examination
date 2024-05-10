import axios from "axios";
import { DOCKER_URL } from "../../config";

export async function POST(request) {
  try {
    const req = {};
    req.body = await request.json();
    if (!req.body.code || req.body.code == "") {
      const responseBody = JSON.stringify({ message: "No Code Found" });

      return new Response(responseBody, {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else if (!req.body.lang_id || req.body.lang_id == "") {
      // return new Response.status(400).json({ message: "Please send a language id" });
      const responseBody = JSON.stringify({
        message: "Please send a language id",
      });
      return new Response(responseBody, {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else if (!req.body.input) {
      // return new Response.status(400).json({ message: "Please send custom testcases" });
      const responseBody = JSON.stringify({
        message: "Please send custom testcases",
      });
      return new Response(responseBody, {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      const inputTestcases = req.body.input;
      const expectedOutput = "HELLO";
      // console.log("expectedOutput", expectedOutput);
      const userCode = req.body.code;
      let data = JSON.stringify({
        source_code: userCode,
        language_id: req.body.lang_id,
        stdin: inputTestcases,
        expected_output: expectedOutput,
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: `${DOCKER_URL}submissions/?base64_encoded=false&wait=false&cpu_time_limit=10`,
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await axios.request(config);
      let judgement = await new Promise(function (resolve, reject) {
        setTimeout(async function () {
          const judgement = await axios.get(
            `${DOCKER_URL}submissions/${response.data.token}?base64_encoded=true&fields=stdout,stderr,status_id,language_id,compile_output,status,time,stdin`,
            {
              responseType: "arraybuffer",
            }
          );
          resolve(judgement);
        }, 2000);
      });

      //   const judgement = await response.json()
      let repj = await JSON.parse(
        Buffer.from(judgement.data, "base64").toString()
      );
      while (repj.status_id == 2 || repj.status_id == 1) {
        judgement = await new Promise(function (resolve, reject) {
          setTimeout(async function () {
            const judgement = await axios.get(
              `${DOCKER_URL}submissions/${response.data.token}?base64_encoded=true&fields=stdout,stderr,status_id,language_id,compile_output,status,time,stdin`,
              {
                responseType: "arraybuffer",
              }
            );
            resolve(judgement);
          }, 2000);
        });

        //   const judgement = await response.json()
        repj = await JSON.parse(
          Buffer.from(judgement.data, "base64").toString()
        );
      }
      //   console.log("judgement",response.data);
      console.log(repj);

      // let str2 = repj.compile_output                                                                                                                                                                                                                               OyBpbnQgbWFpbigpeyBjcmV0dXJuIDA7fQogICAgICB8ICAgICAgICAgICAg
      const errM = repj.compile_output
        ? repj.compile_output
        : repj.stderr
        ? repj.stderr
        : null;
      var buffer = errM ? Buffer.from(errM, "base64") : null;
      let decoded = errM ? buffer.toString() : null;
      let stdout = repj.stdout
        ? Buffer.from(repj.stdout, "base64")?.toString()
        : null;
      const responsebody = JSON.stringify({
        token: response.data,
        judgement: repj,
        decoded,
        stdout,
      });
      return new Response(responsebody, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (err) {
    console.log("INSIDE ERROR");
    console.log(err);
    return new Response(
      JSON.stringify({
        err: err,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // console.log(err);
    // res.status(400).json({ message: err });
  }
}
