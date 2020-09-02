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
