/**
 * Permission Slice Reducer
 * 处理用户权限的同步更新逻辑
 */

import { produce } from 'immer';

// Permission Reducer Actions
export interface SetPermissionsAction {
  type: 'setPermissions';
  value: string[];
}

export interface AddPermissionAction {
  type: 'addPermission';
  value: string;
}

export interface RemovePermissionAction {
  type: 'removePermission';
  value: string;
}

export interface ClearPermissionsAction {
  type: 'clearPermissions';
}

export interface SetPermissionErrorAction {
  type: 'setPermissionError';
  value: {
    type: string;
    message: string;
    code?: string;
  };
}

export interface ClearPermissionErrorAction {
  type: 'clearPermissionError';
}

export interface SetPermissionsInitAction {
  type: 'setPermissionsInit';
  value: boolean;
}

export type PermissionDispatch =
  | SetPermissionsAction
  | AddPermissionAction
  | RemovePermissionAction
  | ClearPermissionsAction
  | SetPermissionErrorAction
  | ClearPermissionErrorAction
  | SetPermissionsInitAction;

// Permission State Interface
export interface PermissionSliceState {
  permissions: string[];
  permissionError?: {
    type: string;
    message: string;
    code?: string;
  };
  permissionsInit: boolean;
}

// Permission Reducer
export const permissionReducer = (state: PermissionSliceState, payload: PermissionDispatch): PermissionSliceState => {
  switch (payload.type) {
    case 'setPermissions':
      return produce(state, (draft) => {
        draft.permissions = payload.value;
        draft.permissionsInit = true;
        draft.permissionError = undefined;
      });

    case 'addPermission':
      return produce(state, (draft) => {
        if (!draft.permissions.includes(payload.value)) {
          draft.permissions.push(payload.value);
        }
        draft.permissionError = undefined;
      });

    case 'removePermission':
      return produce(state, (draft) => {
        draft.permissions = draft.permissions.filter(p => p !== payload.value);
        draft.permissionError = undefined;
      });

    case 'clearPermissions':
      return produce(state, (draft) => {
        draft.permissions = [];
        draft.permissionsInit = false;
      });

    case 'setPermissionError':
      return produce(state, (draft) => {
        draft.permissionError = payload.value;
      });

    case 'clearPermissionError':
      return produce(state, (draft) => {
        draft.permissionError = undefined;
      });

    case 'setPermissionsInit':
      return produce(state, (draft) => {
        draft.permissionsInit = payload.value;
      });

    default:
      return state;
  }
};