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

import { useCallback, useEffect, useState } from "react";
import { EmbeddedEditorRef } from "./EmbeddedEditor";

export function useDirtyState(editor?: EmbeddedEditorRef) {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(editor?.getStateControl().isDirty() ?? false)
    const callback = editor?.getStateControl().subscribe(setIsDirty)!;
    return () => {
      editor?.getStateControl().unsubscribe(callback);
    };
  }, [editor]);

  return isDirty;
}

export function useEditorRef() {
  const [editor, setEditor] = useState<EmbeddedEditorRef | undefined>(null);

  const ref = useCallback((node: EmbeddedEditorRef) => {
    if (node !== null) {
      setEditor(node);
    }
  }, []);
  return { editor, ref };
}
