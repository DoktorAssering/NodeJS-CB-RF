const http = require("http");
const soap = require("soap");

const service = {
  MyService: {
    MyPort: {
      GetCursOnDateXML: function (args, callback) {
        callback(null, { result: "Data for GetCursOnDateXML" });
      },
      GetCursDynamicXML: function (args, callback) {
        callback(null, { result: "Data for GetCursDynamicXML" });
      },
    },
  },
};

const xml = require("fs").readFileSync("DailyInfo.wsdl", "utf8");
const server = http.createServer((req, res) => {
  res.end("404: Not Found");
});

server.listen(3000);
soap.listen(server, "/test", service, xml);
