#!/bin/bash
set -e

echo "========================================="
echo "Release Unused Elastic IP Addresses"
echo "========================================="
echo ""

AWS_REGION="us-east-1"

echo "Step 1: Listing all Elastic IP addresses..."
echo ""

# Get all EIPs
ALL_EIPS=$(aws ec2 describe-addresses \
  --region $AWS_REGION \
  --query 'Addresses[*].[PublicIp,AllocationId,AssociationId,InstanceId,NetworkInterfaceId]' \
  --output text)

if [ -z "$ALL_EIPS" ]; then
  echo "No Elastic IP addresses found in $AWS_REGION"
  exit 0
fi

echo "Current Elastic IP addresses:"
echo "-----------------------------------------------------------"
printf "%-15s %-25s %-20s %-15s\n" "Public IP" "Allocation ID" "Association ID" "Instance ID"
echo "-----------------------------------------------------------"

while IFS=$'\t' read -r public_ip alloc_id assoc_id instance_id nic_id; do
  if [ -z "$assoc_id" ] || [ "$assoc_id" == "None" ]; then
    printf "%-15s %-25s %-20s %-15s (UNUSED)\n" "$public_ip" "$alloc_id" "None" "None"
  else
    printf "%-15s %-25s %-20s %-15s (IN USE)\n" "$public_ip" "$alloc_id" "$assoc_id" "$instance_id"
  fi
done <<< "$ALL_EIPS"

echo "-----------------------------------------------------------"
echo ""

# Get unassociated EIPs
UNUSED_EIPS=$(aws ec2 describe-addresses \
  --region $AWS_REGION \
  --query 'Addresses[?AssociationId==`null`].[AllocationId,PublicIp]' \
  --output text)

if [ -z "$UNUSED_EIPS" ]; then
  echo "✅ No unused Elastic IP addresses found."
  echo ""
  echo "All EIPs are currently in use. You have reached the EIP limit."
  echo ""
  echo "Options:"
  echo "1. Request an EIP limit increase from AWS Support"
  echo "2. Terminate an unused EC2 instance to free up an EIP"
  echo "3. Manually release an EIP from AWS Console if you know it's not needed"
  exit 0
fi

echo "Found unused Elastic IP addresses:"
echo ""

UNUSED_COUNT=0
while IFS=$'\t' read -r alloc_id public_ip; do
  if [ -n "$alloc_id" ]; then
    echo "  - $public_ip (Allocation ID: $alloc_id)"
    UNUSED_COUNT=$((UNUSED_COUNT + 1))
  fi
done <<< "$UNUSED_EIPS"

echo ""
echo "Total unused EIPs: $UNUSED_COUNT"
echo ""

read -p "Do you want to release ALL unused Elastic IPs? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Cancelled. No EIPs were released."
  exit 0
fi

echo ""
echo "Releasing unused Elastic IP addresses..."
echo ""

RELEASED_COUNT=0
while IFS=$'\t' read -r alloc_id public_ip; do
  if [ -n "$alloc_id" ]; then
    echo "Releasing $public_ip ($alloc_id)..."
    aws ec2 release-address \
      --allocation-id $alloc_id \
      --region $AWS_REGION
    
    if [ $? -eq 0 ]; then
      echo "✅ Released: $public_ip"
      RELEASED_COUNT=$((RELEASED_COUNT + 1))
    else
      echo "❌ Failed to release: $public_ip"
    fi
  fi
done <<< "$UNUSED_EIPS"

echo ""
echo "========================================="
echo "✅ Released $RELEASED_COUNT Elastic IP(s)"
echo "========================================="
echo ""
echo "You can now create the Elastic Beanstalk environment:"
echo "  ./create-eb-environment.sh"
echo ""

