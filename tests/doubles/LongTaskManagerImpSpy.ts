import {LongTask} from "../../src/Domain/LongTask";
import {Logger} from "../../src/Shared/Log/Logger";
import {UserId} from "../../src/Shared/Values/UserId";
import {LongTaskId} from "../../src/Domain/LongTaskId";
import {Backoff} from "../../src/Shared/Backoff/Backoff";
import {LongTaskType} from "../../src/Domain/LongTaskType";
import {LongTaskTracker} from "../../src/Domain/LongTaskTracker";
import {LongTaskManager} from "../../src/Domain/LongTaskManager";
import {LongTaskProgress} from "../../src/Domain/LongTaskProgress";
import {LongTaskSettings} from "../../src/Domain/LongTaskSettings";
import {LongTaskRegistry} from "../../src/Domain/LongTaskRegistry";
import {LongTaskRepository} from "../../src/Domain/LongTaskRepository";
import {LongTaskParameters} from "../../src/Domain/LongTaskParameters";
import {LongTaskManagerImp} from "../../src/Domain/LongTaskManagerImp";

export class LongTaskManagerImpSpy extends LongTaskManagerImp {
    private startCallCount: number;
    private addTaskCallCount: number;
    private updateTaskProgressCallCount: number;
    private completedTaskCallCount: number;
    private failedTaskCallCount: number;
    private cancelTaskCallCount: number;
    private deleteTaskCallCount: number;
    private getTasksCurrentlyProcessingCallCount: number;
    private getTasksForSearchKeyCallCount: number;
    private getTasksForUserIdCallCount: number;

    constructor(
        logger: Logger,
        backoff: Backoff,
        settings: LongTaskSettings,
        processing: LongTaskTracker,
        repository: LongTaskRepository,
        taskProcessors: LongTaskRegistry
    ) {
        super(logger, backoff, settings, processing, repository, taskProcessors);
        
        this.startCallCount = 0;
        this.addTaskCallCount = 0;
        this.updateTaskProgressCallCount = 0;
        this.completedTaskCallCount = 0;
        this.failedTaskCallCount = 0;
        this.cancelTaskCallCount = 0;
        this.deleteTaskCallCount = 0;
        this.getTasksCurrentlyProcessingCallCount = 0;
        this.getTasksForSearchKeyCallCount = 0;
        this.getTasksForUserIdCallCount = 0;
    }

    public start(): void {
        this.startCallCount +=1;
        super.start();
    }

    public startCount(): number {
        return this.startCallCount;
    }

    public addTask(taskType: LongTaskType, params: LongTaskParameters, ownerId: UserId, searchKey: string | Array <string>): Promise <LongTaskId> {
        this.addTaskCallCount += 1;
        return super.addTask(taskType, params, ownerId, searchKey);
    }

    public addTaskCount(): number {
        return this.addTaskCallCount;
    }

    public updateTaskProgress(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
        this.updateTaskProgressCallCount += 1;
        return super.updateTaskProgress(taskId, progress);
    }

    public updateTaskProgressCount(): number {
        return this.updateTaskProgressCallCount;
    }

    public completedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
        this.completedTaskCallCount += 1;
        return super.completedTask(taskId, progress);
    }

    public completedTaskCount(): number {
        return this.completedTaskCallCount;
    }
    
    public failedTask(taskId: LongTaskId, progress: LongTaskProgress): Promise <void> {
        this.failedTaskCallCount += 1;
        return super.failedTask(taskId, progress);
    }

    public failedTaskCount(): number {
        return this.failedTaskCallCount;
    }

    public cancelTask(taskId: LongTaskId): Promise <void> {
        this.cancelTaskCallCount += 1;
        return super.cancelTask(taskId);
    }

    public cancelTaskCount(): number {
        return this.cancelTaskCallCount;
    }

    public deleteTask(taskId: LongTaskId): Promise <void> {
        this.deleteTaskCallCount += 1;
        return super.deleteTask(taskId);
    }

    public deleteTaskCount(): number {
        return this.deleteTaskCallCount;
    }

    public getTasksCurrentlyProcessing(): Promise <Array <LongTask>> {
        this.getTasksCurrentlyProcessingCallCount += 1;
        return super.getTasksCurrentlyProcessing();
    }

    public getTasksCurrentlyProcessingCount(): number {
        return this.getTasksCurrentlyProcessingCallCount;
    }

    public getTasksForSearchKey(searchKey: string | Array <string>): Promise <Array <LongTask>> {
        this.getTasksForSearchKeyCallCount += 1;
        return super.getTasksForSearchKey(searchKey);
    }

    public getTasksForSearchKeyCount(): number {
        return this.getTasksForSearchKeyCallCount;
    }

    public getTasksForUserId(userId: UserId): Promise <Array <LongTask>> {
        this.getTasksForUserIdCallCount += 1;
        return super.getTasksForUserId(userId);
    }

    public getTasksForUserIdCount(): number {
        return this.getTasksForUserIdCallCount;
    }
}
