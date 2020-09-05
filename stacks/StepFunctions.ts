import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";

export class StepFunctionsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.basicSfn();
    this.parallelSfn();
    this.conditionalSfn();
  }

  // シーケンシャルステップを持つ基本的な Step Functions
  // MEMO: task の名前も含めてユニークな名前にする必要がある。
  private basicSfn() {
    // lambda関数を作成
    const taskFn = this.createLambdaFn("basicLambdaFn", "task.basicLambdaFn");

    // Step Functionsの入出力 & 使用するLambda関数を定義
    const firstState = new tasks.LambdaInvoke(this, "最初の処理", {
      lambdaFunction: taskFn,
      outputPath: "$.Payload",
    });
    const secondState = new tasks.LambdaInvoke(this, "次の処理", {
      inputPath: "$",
      lambdaFunction: taskFn,
    });

    // パイプラインの定義
    const basicDefinition = firstState.next(secondState);

    // ステートマシン（Step Functions）の作成
    new sfn.StateMachine(this, "stateMachine", {
      stateMachineName: "basic-state-machine",
      definition: basicDefinition,
    });
  }

  // 並列処理を使った Step Functions
  private parallelSfn() {
    // lambda関数を作成
    const parallel1taskFn = this.createLambdaFn(
      "parallel1LambdaFn",
      "task.parallel1LambdaFn"
    );
    const parallel2taskFn = this.createLambdaFn(
      "parallel2LambdaFn",
      "task.parallel2LambdaFn"
    );
    const finalTaskFn = this.createLambdaFn(
      "finalLambdaFn",
      "task.finalLambdaFn"
    );

    // Step Functionsの入出力 & 使用するLambda関数を定義
    const parallelState1 = new tasks.LambdaInvoke(this, "並列処理１", {
      lambdaFunction: parallel1taskFn,
      outputPath: "$.Payload",
    });
    const parallelState2 = new tasks.LambdaInvoke(this, "並列処理２", {
      lambdaFunction: parallel2taskFn,
      outputPath: "$.Payload",
    });
    const finalState = new tasks.LambdaInvoke(this, "最後の処理", {
      inputPath: "$",
      lambdaFunction: finalTaskFn,
    });

    // パイプラインの定義
    const parallelDefinition = new sfn.Parallel(this, "parallelTasks");
    parallelDefinition.branch(parallelState1, parallelState2).next(finalState);

    // ステートマシン（Step Functions）の作成
    new sfn.StateMachine(this, "parallelStateMachine", {
      stateMachineName: "parallel-state-machine",
      definition: parallelDefinition,
    });
  }

  // 条件分岐を使った Step Functions
  private conditionalSfn() {
    // lambda関数を作成
    const conditionalTaskFn = this.createLambdaFn(
      "confitionalLambdaFn",
      "task.confitionalLambdaFn"
    );
    const successTaskFn = this.createLambdaFn(
      "successLambdaFn",
      "task.successLambdaFn"
    );
    const failedTaskFn = this.createLambdaFn(
      "failedLambdaFn",
      "task.failedLambdaFn"
    );

    // Step Functionsの入出力 & 使用するLambda関数を定義
    const conditionalState = new tasks.LambdaInvoke(this, "色を選択する処理", {
      lambdaFunction: conditionalTaskFn,
      outputPath: "$.Payload",
    });
    const successState = new tasks.LambdaInvoke(this, "処理成功", {
      lambdaFunction: successTaskFn,
      outputPath: "$.Payload",
    });
    const failedState = new tasks.LambdaInvoke(this, "処理失敗", {
      lambdaFunction: failedTaskFn,
      outputPath: "$.Payload",
    });

    // 条件分岐の処理
    const choice = new sfn.Choice(this, "条件分岐（あなたの好きな色は？");
    choice.when(
      sfn.Condition.stringEquals("$.color", "私は「青」が好きです！"),
      successState
    );
    choice.when(
      sfn.Condition.stringEquals("$.color", "私は「赤」が好きです！"),
      failedState
    );
    choice.otherwise(
      new sfn.Fail(this, "青でも赤でもないだと！てめぇはダメだ！")
    );

    // パイプラインの定義
    const conditionalDefinition = conditionalState.next(choice);

    // ステートマシン（Step Functions）の作成
    new sfn.StateMachine(this, "conditionalStateMachine", {
      stateMachineName: "conditional-state-machine",
      definition: conditionalDefinition,
    });
  }

  // Lambda作成用関数
  private createLambdaFn(fnName: string, handler: string) {
    return new lambda.Function(this, fnName, {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("dist/src"),
      handler: handler,
    });
  }
}
