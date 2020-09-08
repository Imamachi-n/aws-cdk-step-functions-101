import { isDate } from "util";

type TaskResponse = {
  title: string;
  message: string;
};

export async function basicLambdaFn(event: any): Promise<TaskResponse> {
  console.log(JSON.stringify(event));

  return {
    title: "ようこそ！",
    message: "Step Functions の世界へ！",
  };
}

export async function parallel1LambdaFn(event: any): Promise<TaskResponse> {
  console.log(JSON.stringify(event));

  return {
    title: "並列処理",
    message: "処理１を実行しました。",
  };
}
export async function parallel2LambdaFn(event: any): Promise<TaskResponse> {
  console.log(JSON.stringify(event));

  await sleep(2000);

  return {
    title: "並列処理",
    message: "処理２を実行しました。",
  };
}

export async function finalLambdaFn(event: any): Promise<object> {
  return {
    response: event,
  };
}

export async function confitionalLambdaFn(event: any): Promise<Object> {
  switch (getRandomInt(2)) {
    case 0:
      return {
        color: "私は「青」が好きです！",
      };
    case 1:
      return {
        color: "私は「赤」が好きです！",
      };
    default:
      // 2 のケース
      return {
        color: "私はどの色も…",
      };
  }
}

export async function successLambdaFn(event: any): Promise<Object> {
  return {
    message: "処理が成功しました！",
    input: event,
  };
}

export async function failedLambdaFn(event: any): Promise<Object> {
  return {
    message: "処理が失敗しました…。",
    input: event,
  };
}

export async function mapLambdaFn(event: any): Promise<Object> {
  await sleep(2000);

  return {
    message: `並列処理: #${event}`,
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getRandomInt(max: number) {
  return Math.round(Math.random() * max);
}
