const mysql = require("mysql2");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "sqltodolist",
});
connection.connect((err) => {
  if (err) {
    console.error("接続エラー: " + err.stack);
    return;
  }
  console.log("接続成功: " + connection.threadId);
});
function mainMenu() {
  rl.question("何をしますか？ type help:", (answer) => {
    switch (answer) {
      case "help":
        help();
        break;
      case "add":
        add();
        break;
      case "delete":
        deleteTodo();
        break;
      case "reset":
        reset();
        break;
      case "ls":
        ls();
        break;
      case "exit":
        exit();
        break;
      default:
        console.log("不明なコマンドです");
        mainMenu();
    }
  });
}
function help() {
  console.log("help: ヘルプを表示");
  console.log("add: タスクの追加");
  console.log("delete: タスクの削除");
  console.log("reset: タスクのリセット");
  console.log("ls: タスクの一覧表示");
  console.log("exit: 終了");
  mainMenu();
}
function add() {
  rl.question("タスクを入力してください:", (task) => {
    const sql = "INSERT INTO todos (todo) VALUES (?)";
    connection.query(sql, [task], (err, result) => {
      if (task === "") {
        console.log("タスクを入力してください");
        mainMenu();
        return;
      }
      if (err) {
        console.error("エラー: " + err.stack);
        exit();
      }
      console.log("追加されました");
      mainMenu();
    });
  });
}
function deleteTodo() {
  rl.question("削除するタスクのIDを入力してください:", (id) => {
    const sql = "delete from todos where id = ?";
    if (id === "") {
      console.log("IDを入力してください");
      mainMenu();
      return;
    }
    if (isNaN(id)) {
      console.log("IDは数字で入力してください");
      mainMenu();
      return;
    }
    connection.query(sql, [id], (err, result) => {
      if (err) {
        console.error("エラー: " + err.stack);
        exit();
      }
      if (result.affectedRows === 0) {
        console.log("IDが見つかりませんでした");
        mainMenu();
        return;
      }
      console.log("削除されました");
      mainMenu();
    });
  });
}
function reset() {
  const sql = "truncate table todos";
  rl.question("本当にリセットしますか？(y/n):", (answer) => {
    if (answer !== "y") {
      console.log("リセットをキャンセルしました");
      mainMenu();
      return;
    } else {
      connection.query(sql, (err, result) => {
        if (err) {
          console.error("エラー: " + err.stack);
          exit();
        }
        console.log("リセットされました");
        mainMenu();
      });
    }
  });
}
function ls() {
  const sql = "select * from todos";
  connection.query(sql, (err, result) => {
    if (err) {
      console.error("エラー: " + err.stack);
      exit();
    }
    if (result.length === 0) {
      console.log("タスクはありません");
      mainMenu();
      return;
    }
    result.forEach((todo) => {
      console.log(`ID:${todo.id}: ${todo.todo}`);
    });
    mainMenu();
  });
}
function exit() {
  connection.end();
  rl.close();
  return;
}
setTimeout(() => {
  mainMenu();
}, 1000);
