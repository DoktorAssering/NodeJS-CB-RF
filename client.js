const soap = require("soap");
const readline = require("readline");

const url = "https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx?WSDL";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getDayOfWeek = (dateString) => {
  const daysOfWeek = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
  const date = new Date(dateString);
  const dayIndex = date.getDay();
  return daysOfWeek[dayIndex];
};

const printCurrencyData = (currencyData, date) => {
  if (currencyData && currencyData.length > 0) {
    console.log(`Данные по валютам на ${date} (${getDayOfWeek(date)}):`);
    currencyData.forEach(valute => {
      const currencyCode = valute.VchCode || valute.Vcode;
      console.log(`Название валюты: ${valute.Vname}, Код: ${currencyCode}, Номинал: ${valute.Vnom}, Курс: ${valute.Vcurs} к рублю`);
    });
  } else {
    console.log("Данные отсутствуют.");
  }
};

const getCursOnDateXML = (currentDate, currencyCodes) => {
  soap.createClient(url, (err, client) => {
    if (err) {
      console.error(err);
      return;
    }

    client.GetCursOnDateXML({ On_date: currentDate }, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      const valuteCursOnDate = result.GetCursOnDateXMLResult.ValuteData.ValuteCursOnDate;

      if (currencyCodes && currencyCodes.length > 0) {
        const filteredCurrencyData = valuteCursOnDate.filter(valute => currencyCodes.includes(valute.VchCode));
        printCurrencyData(filteredCurrencyData, currentDate);
      } else {
        printCurrencyData(valuteCursOnDate, currentDate);
      }
    });
  });
};

const getCursDynamicXML = (params, fromDate, toDate, currencyCode) => {
  soap.createClient(url, (err, client) => {
    if (err) {
      console.error(err);
      return;
    }

    client.GetCursDynamicXML(params, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      const valuteData = result.GetCursDynamicXMLResult.ValuteData;

      if (valuteData && valuteData.ValuteCursDynamic) {
        const valuteCursDynamic = valuteData.ValuteCursDynamic;

        if (Array.isArray(valuteCursDynamic)) {
          if (currencyCode) {
            const filteredCurrencyData = valuteCursDynamic.filter(valute => valute.Vcode === currencyCode);
            printCurrencyData(filteredCurrencyData, fromDate);
          } else {
            printCurrencyData(valuteCursDynamic, fromDate);
          }
        } else if (valuteCursDynamic) {
          printCurrencyData([valuteCursDynamic], fromDate);
        } else {
          console.log("Данные отсутствуют.");
        }
      } else {
        console.log("Данные отсутствуют.");
      }
    });
  });
};

rl.question("\nВыберите действие:\n\n1. Получить данные по валютам на определенную дату\n\n2. Получить динамику валюты в заданном диапазоне дат\n\nВведите номер действия (1 или 2): ", (choice) => {
  if (choice === "1") {
    rl.question("\nВведите дату (ГГГГ-ММ-ДД): ", (currentDate) => {
      rl.question("\nВведите коды валют (Разделенные запятой, или нажмите Enter для всех): ", (input) => {
        const currencyCodesForOnDate = input.trim() ? input.trim().split(",") : [];
        getCursOnDateXML(currentDate, currencyCodesForOnDate);
        rl.close();
      });
    });
  } else if (choice === "2") {
    rl.question("\nВведите начальную дату (ГГГГ-ММ-ДД): ", (fromDate) => {
      rl.question("\nВведите конечную дату (ГГГГ-ММ-ДД): ", (toDate) => {
        rl.question("\nВведите код валюты для динамических данных (Или нажмите Enter для всех): ", (currencyCodeForDynamic) => {
          const dynamicParams = {
            FromDate: `${fromDate}T10:30:00`,
            ToDate: `${toDate}T10:30:00`,
            ValutaCode: currencyCodeForDynamic.trim() || "R01239",
          };

          getCursDynamicXML(dynamicParams, fromDate, toDate, currencyCodeForDynamic.trim());
          rl.close();
        });
      });
    });
  } else {
    console.log("Ошибка неверный выбор... Пожалуйста, введите 1 или 2.");
    rl.close();
  }
});
