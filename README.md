## Идея продукта
Продуктом в данном случае является чат.

Он должен иметь возможность быть быстро донастроен или расширен - поэтому желательно заложить гибкую архитектуру. Вдруг продукт выстрелит?

С другой стороны, нужно проверить замысел быстро - поэтому важно не закопаться в реализации, а выкатить рабочую версию быстро.

## Идея решения
Чат на NodeJS уже наверняка был создан - поэтому нелишне [изучить существующие библиотеки на эту тему](https://github.com/search?l=JavaScript&o=desc&q=chat&s=stars&type=Repositories).

Исходя из технических ограничений продукта "SPA — в разработке можно использовать Angular или React." самый топовый вариант из потенциально подходящих библиотек [RocketChat](https://github.com/RocketChat/Rocket.Chat) не подходит, поскольку он использует инфраструктуру Meteor.

Hubot - следующий в списке: гибкий расширяемый консольный чат-бот от Github. Можно создать веб-интерфейс к нему, а саму логику собрать из готовых модулей к нему и дописать недостающее в виде плагина к Hubot.

Соответственно, идея решения заключается в следующем:
- [React](https://github.com/facebook/react) (отвечает за интерактивный веб-интерфейс приложения)
- [react-socket-io](https://github.com/charleslxh/react-socket-io) (связка React с Socket.io)
- [Socket.io](https://github.com/socketio/socket.io) (интерфейс к браузерной функциональности Websockets)
- Websockets (связь фронта с бэкендом, [браузеры поддерживают](https://caniuse.com/#feat=websockets))
- [hubot-websocket](https://github.com/BettrFinance/hubot-websocket) (связка Websocket с Hubot)
- [Hubot](https://github.com/hubotio/hubot) (расширяемый движок чат-бота)
- [hubot-rec](https://github.com/tily/hubot-rec) (сохранение истории сообщений Hubot)

На будущее:
- [hubot-mongodb-brain](https://github.com/shokai/hubot-mongodb-brain) (плагин к Hubot, позволяющий сохранять содержимое "мозга" (brain) бота в Mongo)

## Версии, использованные при разработке
- npm: 5.8.0
- nodejs: v9.11.1

## Инструкция по установке
```
npm install
cd roowixhubot && npm link ../hubot-websocket && cd ..
npm link roowixhubot
npm run-script start
```

## Примечания
В случае проблем с “cannot find module” - https://stackoverflow.com/a/14515868 .

Адаптер `hubot-websocket` взят [отсюда](https://github.com/BettrFinance/hubot-websocket) - поскольку это форк, то его приходится устанавливать отдельно через `npm link` (см. выше).

## Что в итоге
В итоге получился нерабочий "франкенштейн", слепленный из различных туториалов и библиотек с примерами, например:
- https://github.com/charleslxh/react-socket-io/tree/master/example
- https://github.com/jskz/react-websocket-chat
- https://habrahabr.ru/post/318148/
