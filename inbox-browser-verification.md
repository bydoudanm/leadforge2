# Inbox browser verification

Date: 2026-08-15

The authenticated `/inbox` route loaded successfully after the dev server refresh. The shared Sidebar visibly includes Inbox beneath Outreach, and the compact top navigation also exposes Inbox. The page renders the Gmail inbox pool with an email input, daily cap input, and Add Inbox action. It renders the Rotation loop panel with an enable switch, safety messaging, delay control, selected inbox summary, and Save rotation settings action. The empty state correctly explains that no inboxes exist yet. The UI explicitly states that credentials and OAuth tokens are not entered into the form and that active rotation requires connected inboxes with remaining daily capacity.

The final live preview after the rotation-next endpoint change still rendered the same Inbox workspace successfully. The Sidebar showed both the top Inbox button and the expanded Inbox navigation item, while the empty Gmail pool state, Add Inbox form, rotation switch, delay field, selected-inbox summary, and save control were all visible. No persistent test inbox was created in the user's database during browser verification; CRUD and cursor advancement were covered through the authenticated API tests instead.

The live Inbox form accepted the temporary QA address `qa.inbox.rotation@example.com` and created a persistent inbox row. The UI updated to `0 / 1` connected inboxes, showed `0/50 sent today`, displayed `Authorization pending`, and preserved the safe messaging that Gmail authorization is required before sending. The temporary row will be removed after the remaining UI checks.

The QA inbox row rendered with its checkbox, pending authorization badge, Active control, Connect action, and Remove action. Selecting the checkbox immediately updated the rotation panel to `1 selected · 0 eligible now` and displayed the inbox as position 1 in the selected rotation list. This confirms the UI selection state and deterministic ordering presentation.

The rotation panel successfully saved the selected QA inbox with a 60-second delay while remaining paused. The UI displayed `Rotation loop settings saved and paused`, retained `1 selected · 0 eligible now`, and kept the inbox in position 1. The paused state was intentional because the inbox is not yet Gmail-authorized; the API guard prevents enabling live rotation until an authorized, connected inbox is available.

The temporary QA inbox was removed through the live UI after verification. The page confirmed `Inbox removed from the rotation pool`, returned to `0 / 0` connected inboxes, cleared the selected-inbox list, and restored the empty Gmail pool state. No test inbox remains in the user's database.

A second verification pass created `qa.inbox.one@example.com` successfully. The page showed `0 / 1` connected inboxes, an authorization-pending state, and the inbox row with Active, Connect, selection, and Remove controls. The rotation switch remained off because authorization is not yet available.

The Inbox pool now contains two temporary QA rows, `qa.inbox.two@example.com` and `qa.inbox.one@example.com`, both showing `0/50 sent today`, `Authorization pending`, Active controls, and selection checkboxes. The connected counter displayed `0 / 2`, confirming multi-inbox CRUD and ordering support before selection.

Both temporary QA inboxes were selected successfully. The rotation panel displayed `2 selected · 0 eligible now` and preserved deterministic order: position 1 `qa.inbox.two@example.com`, position 2 `qa.inbox.one@example.com`. This verifies the multi-inbox selection and round-robin ordering UI without enabling unauthorized senders.

The two-inbox configuration saved successfully. The UI displayed `Rotation loop settings saved and paused`, retained `2 selected · 0 eligible now`, kept the 60-second delay, and preserved the ordered list with both QA inboxes. The paused result is expected because neither inbox is Gmail-authorized.

The first QA inbox state control changed from `Active` to `Paused` in the live UI, confirming the persisted state transition. It was then removed successfully; the page returned to `0 / 1` and retained the second QA inbox with its selection state, proving the paused row cleanup path works.

The final QA inbox was removed successfully. The live workspace returned to `0 / 0` with the empty pool message and `0 selected · 0 eligible now`; no temporary inbox records remain.
