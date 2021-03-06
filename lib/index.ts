/*

Status flow:

         INIT
          |
       PENDING
        /   \
SUCCEEDED   FAILED

*/

import { AnyAction, Reducer } from 'redux';

export enum Status {
  INIT = 'INIT',
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  NO_MORE = 'NO_MORE'
}

export type AsyncData<T> = {
  status: Status;
  data: T;
  error?: string;
  hasMore?: boolean; // hasMore is used for pagination
};

export function createAsyncData<T>(
  data: T,
  enablePaging?: boolean
): AsyncData<T> {
  return {
    status: Status.INIT,
    data: data,
    hasMore: enablePaging
  };
}

export function createAsyncType(type: string, status: Status) {
  return type + '.' + status;
}

export function createAsyncAction(
  type: string,
  status: Status,
  payload?: any
): AnyAction {
  return { type: createAsyncType(type, status), payload, isAsync: true };
}

export function pending(type: string, payload?: any): AnyAction {
  return {
    type: createAsyncType(type, Status.PENDING),
    payload,
    isAsync: true
  };
}
export function succeeded(type: string, payload?: any): AnyAction {
  return {
    type: createAsyncType(type, Status.SUCCEEDED),
    payload,
    isAsync: true
  };
}
export function failed(type: string, payload?: any): AnyAction {
  return { type: createAsyncType(type, Status.FAILED), payload, isAsync: true };
}
export function noMore(type: string, payload?: any): AnyAction {
  return {
    type: createAsyncType(type, Status.NO_MORE),
    payload,
    isAsync: true
  };
}

export function updateAsyncData(
  asyncData: AsyncData<any>,
  action: AnyAction,
  reducer?: Reducer
) {
  const { status } = parseAsyncType(action.type);
  if (status === Status.FAILED) {
    return { ...asyncData, status: Status.FAILED, error: action.payload };
  } else if (status === Status.NO_MORE) {
    return { ...asyncData, hasMore: false };
  } else if (status === Status.PENDING) {
    return { ...asyncData, status: Status.PENDING };
  } else if (status === Status.SUCCEEDED) {
    return {
      ...asyncData,
      status: Status.SUCCEEDED,
      data: !!reducer ? reducer(asyncData.data, action) : action.payload
    };
  } else {
    return asyncData;
  }
}

// parseAsyncType('FETCH_TODO_LIST.PENDING') -> { type: 'FETCH_TODO_LIST', status: 'PENDING' }
// parseAsyncType('SYNC_ACTION_TYPE') -> { type: 'SYNC_ACTION_TYPE', status: null }
export function parseAsyncType(
  type: string
): { type: string; status: Status | null } {
  const matches = type.match(/^(\S+)\.(\w+$)/);
  if (matches && matches.length >= 3) {
    let status = null;
    if (Status.FAILED === matches[2]) {
      status = Status.FAILED;
    } else if (Status.INIT === matches[2]) {
      status = Status.INIT;
    } else if (Status.NO_MORE === matches[2]) {
      status = Status.NO_MORE;
    } else if (Status.PENDING === matches[2]) {
      status = Status.PENDING;
    } else if (Status.SUCCEEDED === matches[2]) {
      status = Status.SUCCEEDED;
    }
    return { type: matches[1], status };
  } else {
    return { type, status: null };
  }
}

export function isInit(asyncData: AsyncData<any>) {
  return asyncData.status === Status.INIT;
}
export function isPending(asyncData: AsyncData<any>) {
  return asyncData.status === Status.PENDING;
}
export function isFailed(asyncData: AsyncData<any>) {
  return asyncData.status === Status.FAILED;
}
export function isSucceeded(asyncData: AsyncData<any>) {
  return asyncData.status === Status.SUCCEEDED;
}
export function isFinished(asyncData: AsyncData<any>) {
  return isFailed(asyncData) || isSucceeded(asyncData);
}

export * from './AsyncView';
