# Pseudo-code Django
```python
if
``` loan.processed_by.posts.filter(code='caissier').not_exists():
    raise ValidationError("processed_by doit être un caissier")

if loan.validated_by and loan.validated_by.posts.filter(
    code__in=['superviseur', 'chef_agence']
).not_exists():
    raise ValidationError("validated_by doit être un superviseur")

if loan.loan_officer and loan.loan_officer.posts.filter(
    code='agent_credit'
).not_exists():
    raise ValidationError("loan_officer doit être un agent de crédit")
    
const canEdit = loan.status === 'approuve' && userRole === 'caissier';
const canDisburse = loan.status === 'approuve' && hasOpenSession;
const canRecordPayment = loan.status === 'decaisse';