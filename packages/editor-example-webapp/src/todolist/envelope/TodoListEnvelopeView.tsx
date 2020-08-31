/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MessageBusClient } from "@kogito-tooling/envelope-bus/dist/api";
import * as React from "react";
import { useCallback, useImperativeHandle, useMemo, useState } from "react";
import { Item, TodoListChannelApi } from "../api";

export interface TodoListEnvelopeViewApi {
  setUser(user: string): void;
  addItem(item: string): void;
  getItems(): Item[];
  markAllAsCompleted(): void;
}

export const TodoListEnvelopeView = React.forwardRef<
  TodoListEnvelopeViewApi,
  { channelApi: MessageBusClient<TodoListChannelApi> }
>((props, forwardedRef) => {
  const [user, setUser] = useState<string | undefined>();
  const [items, setItems] = useState<Item[]>([]);

  const removeItem = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, item: Item) => {
      e.preventDefault();
      const itemsCopy = [...items];
      const i = itemsCopy.indexOf(item);
      if (i >= 0) {
        itemsCopy.splice(i, 1);
        setItems(itemsCopy);
        props.channelApi.notify("todoList__itemRemoved", item.label);
      }
    },
    [items]
  );

  const markAsCompleted = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, item: Item, completed: boolean) => {
      e.preventDefault();
      const itemsCopy = [...items];
      const i = itemsCopy.indexOf(item);
      if (i >= 0) {
        itemsCopy[i].completed = completed;
        setItems(itemsCopy);
      }
    },
    [items]
  );

  const allCompleted = useMemo(() => {
    const completedItems = items.filter((i) => i.completed);
    return items.length > 0 && completedItems.length === items.length;
  }, [items]);

  useImperativeHandle(
    forwardedRef,
    () => ({
      setUser,
      addItem: (item) => setItems([...items, { label: item, completed: false }]),
      getItems: () => items,
      markAllAsCompleted: () => setItems(items.map((item) => ({ ...item, completed: true }))),
    }),
    [items]
  );

  return (
    <>
      {user && (
        <>
          <p>
            Welcome, <b>{user}</b>!
          </p>

          <hr />

          <h2>Here's your 'To do' list:</h2>

          {(items.length <= 0 && (
            <>
              <p>Nothing to do 😎</p>
            </>
          )) || (
            <ol>
              {items.map((item) => (
                <li key={item.label} style={{ lineHeight: "2em" }}>
                  {(item.completed && (
                    <>
                      <span style={{ textDecoration: "line-through" }}>{item.label}</span>
                    </>
                  )) || (
                    <>
                      <span>{item.label}</span>
                    </>
                  )}

                  <span>{" - "}</span>

                  {(!item.completed && (
                    <a href={"#"} onClick={(e) => markAsCompleted(e, item, true)}>
                      Mark as completed
                    </a>
                  )) || (
                    <a href={"#"} onClick={(e) => markAsCompleted(e, item, false)}>
                      Unmark as completed
                    </a>
                  )}

                  <span>{" / "}</span>

                  <a href={"#"} onClick={(e) => removeItem(e, item)}>
                    Remove
                  </a>
                </li>
              ))}
            </ol>
          )}
          {allCompleted && (
            <>
              <hr />
              <div>
                <b>Congratulations!</b> You've completed all your items! 🎉
              </div>
            </>
          )}
        </>
      )}
    </>
  );
});
