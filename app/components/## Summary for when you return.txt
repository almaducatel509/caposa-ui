## Summary for when you return:

### Image Upload Bug
The image file isn't being sent during updates. Two potential causes:

1. **Form component issue**: The image file might not be reaching the API function properly. Check if `changes.photo_profil` contains the actual File object in your form submission.

2. **API merging problem**: The `mergeEmployeeData` function might be overwriting the new image with the old data. The line `...changes` should come after `...existing` to prioritize new values.

### Debug steps to try:
1. Add logging in your form component to verify the file is selected
2. Add logging in `putEmployeeMultipart` to check if `changes.photo_profil` contains a File
3. Check if the existing employee data has a photo_profil field that's overriding your new file

### Modal Behavior Fix
Currently the modal shows the detail view after update. To close it instead, change this in `EditEmployeeModal.tsx`:

```typescript
onSuccess={(updated) => {
  setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
  setSelectedEmployee(updated);
  // Remove this line: setShowDetailModal(true);
}}
```

Or in `EmployeeGrid.tsx`, modify the `handleSuccess` to not reopen the detail modal.

### Quick Fix Priority
1. Check the `mergeEmployeeData` function - it might be the culprit
2. Verify file selection in your form component
3. Fix modal closing behavior

The update timestamp changed (20:15), so the update is working - just the image handling needs fixing.

Take your rest, and tackle these systematically when you return.