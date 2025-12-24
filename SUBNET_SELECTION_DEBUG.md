# DocumentDB Subnet Selection - Debug Guide

## What the Script Does Now

### Step 1: Find or Create /24 Subnets
1. **Searches for existing /24 subnets** in VPC `vpc-0366766502072fac8`
2. **Prioritizes subnets from different AZs** (e.g., us-east-1a, us-east-1b)
3. **Creates new /24 subnets** only if none exist in different AZs

### Step 2: Validate Subnet Selection
- Shows all selected subnets with their CIDR blocks and AZs
- Counts unique AZs
- **STOPS with error** if subnets are not in at least 2 different AZs

### Step 3: DB Subnet Group Selection
1. **Check for existing DB Subnet Groups** in the VPC
2. **Analyze each group** to see if it has subnets in 2+ AZs
3. **Use existing group** if it meets requirements
4. **Create new group** with your selected /24 subnets if needed

### Step 4: Final Validation
- Retrieves actual subnets from the selected DB Subnet Group
- Counts unique AZs in the group
- **Auto-fixes** if the group doesn't meet requirements
- Creates a new properly configured group if needed

## Common Issues and Fixes

### Issue 1: Existing group has no subnets or subnets in only 1 AZ
**Fix**: Script automatically creates a new group with your /24 subnets

### Issue 2: Selected /24 subnets are in the same AZ
**Fix**: Script exits with error before creating anything (prevents the DocumentDB error)

### Issue 3: Existing group exists but is misconfigured
**Fix**: Script creates a new group with suffix `-fixed` or `-new`

## What to Look For in Output

### ✅ Good Output:
```
Selected Subnets for DocumentDB:
Subnet IDs: subnet-abc123 subnet-def456

AZ Coverage Analysis:
  Total subnets: 2
  Unique AZs: 2
  AZ list: us-east-1a, us-east-1b

✅ Verified: Subnets are in 2 different Availability Zones
```

### ❌ Bad Output (will cause error):
```
AZ Coverage Analysis:
  Total subnets: 2
  Unique AZs: 1
  AZ list: us-east-1a

❌ ERROR: Subnets are not in different Availability Zones!
```

## Manual Debugging Steps

If you still get the error, run these commands manually:

### 1. Check what DB subnet groups exist:
```bash
aws docdb describe-db-subnet-groups \
  --region us-east-1 \
  --query 'DBSubnetGroups[*].[DBSubnetGroupName,VpcId]' \
  --output table
```

### 2. Check subnets in a specific group:
```bash
aws docdb describe-db-subnet-groups \
  --db-subnet-group-name YOUR_GROUP_NAME \
  --region us-east-1 \
  --query 'DBSubnetGroups[0].Subnets[*].[SubnetIdentifier,SubnetAvailabilityZone.Name]' \
  --output table
```

### 3. Check all /24 subnets in your VPC:
```bash
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=vpc-0366766502072fac8" \
  --query 'Subnets[?contains(CidrBlock, `/24`)].[SubnetId,CidrBlock,AvailabilityZone]' \
  --output table \
  --region us-east-1
```

### 4. Delete a problematic DB subnet group:
```bash
aws docdb delete-db-subnet-group \
  --db-subnet-group-name PROBLEMATIC_GROUP_NAME \
  --region us-east-1
```

## Script Improvements Made

1. ✅ **Comprehensive subnet discovery** - finds all /24 subnets
2. ✅ **Smart AZ selection** - picks subnets from different AZs
3. ✅ **Multi-level validation** - checks before and after creating subnet group
4. ✅ **Auto-fix capability** - creates new group if existing one is bad
5. ✅ **Detailed debugging output** - shows exactly what's happening
6. ✅ **Fail-fast** - stops before creating DocumentDB cluster if subnets are wrong

## Next Steps

1. Run the script: `./setup-aws-resources.sh`
2. Watch the output carefully for the "Selected Subnets" section
3. Verify "Unique AZs: 2" or higher
4. If you see the error again, provide the full output from these sections:
   - "Selected Subnets for DocumentDB"
   - "DB Subnet Group to be used"
   - "Validation Results"

