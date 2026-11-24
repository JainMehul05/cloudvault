# AWS setup

Use the existing `default` profile, `ap-southeast-2`, and `cloudvault-d0c2b49b4347`. Do not deploy the upstream template to run CloudVault.

```powershell
aws sts get-caller-identity --profile default --region ap-southeast-2
aws s3api get-bucket-location --bucket cloudvault-d0c2b49b4347 --region ap-southeast-2
aws s3api get-public-access-block --bucket cloudvault-d0c2b49b4347 --region ap-southeast-2
```

When the temporary browser-login session expires, run `aws login --profile default`. The SDK uses supported login-session credential refresh; no credential export or secret copying is needed. Official Boto3 guidance requires Boto3 1.41+ with AWS Common Runtime for this authentication method. The validated environment uses Boto3/Botocore 1.44.10 and CRT 0.38.0. [Official credentials documentation](https://docs.aws.amazon.com/boto3/latest/guide/credentials.html).

The application requires bucket location/head/public-block inspection and object list/get/put/delete within its own prefix. Existing permissions are used; no IAM changes were made. For a future dedicated identity, an administrator can scope object access to `cloudvault/files/*`, permit prefix-scoped listing, and grant only read access to the optional `cloudvault-test.txt`. Do not automatically broaden roles.

All new writes use UUID keys and `ServerSideEncryption=AES256`; no public ACL is requested. SDK TLS verification remains enabled. Conditional writes avoid overwriting objects. All four bucket public-access blocks were verified true; no settings or policies were changed.

Settings offers read-only diagnostics and an explicit import of the existing test object. This registers local metadata and indexes its bytes; it does not overwrite or delete that original. Other arbitrary bucket objects are not automatically imported.

The local application is not a deployment and should bind only to loopback. AWS account plan, credit balance and future billing were not changed or independently queried. Current storage and transfer costs depend on your account's allowances and region; inspect Billing directly before larger use.
