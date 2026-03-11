# CredPal DevOps Node.js Application

A **production-ready DevOps pipeline** for a Node.js application using Docker, GitHub Actions CI/CD, Terraform (AWS ECS Fargate), and security best practices.

## Architecture Overview

- Application            = Node.js (Express), port 3000
- Database               = Postgres
- Containerization       = Docker (multi-stage, non-root)
- CI/CD                  = GitHub Actions             
- Infrastructure as Code = Terraform 
- Cloud Platform         = AWS (ECS Fargate, ALB, ACM, VPC)
- Deployment Strategy    = Rolling deployment (zero downtime)
- Secrets Management     = GitHub Actions Secrets + Environment Protection

## How to Run the Application Locally

# Clone the repository
- git clone https://github.com/winn0101/credpal-app.git
- cd credpal-app


### Prerequisites

- Docker & Docker-Compose should be installed

### Docker Compose

**Export PostgreSQL Secrets**:
- Run the following commands in your terminal:

 ```bash
 export POSTGRES_USER=your_user
 export POSTGRES_PASSWORD=your_password
 export POSTGRES_DB=your_database
 ```
 Replace `your_user`, `your_password`, and `your_database` with your actual PostgreSQL credentials.

# Start the app
docker-compose up --build

This will:
- Build the Node.js Docker image (multi-stage, non-root user)
- Start a Postgres container
- Expose the app on **http://localhost:3000**

To stop the application:
Run
```bash
docker-compose down
```

## How to Access the App Locally

Once running via `docker-compose up`, the app is available at:

 Endpoint                             URL                          
 Health check                http://localhost:3000/health     
 Status                      http://localhost:3000/status     
 Process                     http://localhost:3000/process    

## How to Deploy the Application

### 1. CI/CD Pipeline (GitHub Actions)

The pipeline is defined in `.github/workflows/ci-cd.yml` and triggers on:

- **Push to `main`** – full build, test, push image, and deploy
- **Pull request to `main`** – build and test only (no deploy)

#### Setup Required GitHub Secrets

DOCKERHUB_USERNAME   
DOCKERHUB_TOKEN 

No secrets are stored in code, all sensitive values are managed via GitHub-Actions Secrets.

#### Manual Approval (Production)

The workflow uses a GitHub Actions **environment** called `production` with a required reviewer. Deployments will pause and wait for manual approval before proceeding.

### 2. Infrastructure Provisioning (Using Terraform)

```bash
cd terraform

# Initialize Terraform
terraform init

# Preview changes
terraform plan 

# Apply infrastructure
terraform apply
```

### 3. Manual Deploy (without CI/CD)

# Build and push image
docker build -t credpal-app:latest .
docker tag credpal-app:latest <registry>/credpal-app:latest
docker push <registry>/credpal-app:latest

Or you can use the docker compose command specified earlier.

## Key Decisions

### Security

1. Non-root Docker user = The Dockerfile creates and switches to a non-root user to minimize privilege attacks.
2. Multi-stage Docker build = Keeps the production image small by excluding unnecessary files and dependencies. Only the runtime artifacts are copied to the final stage improving performance.
3. Secrets in code = All secrets are stored in GitHub Actions Secrets, stored as environment vairable (for local testing only) or AWS Secrets manager or SSM parameter store if deploying to AWS (like ECS) and injected at runtime, avoiding hardcoding sensitive information.
4. HTTPS enforced = The ALB terminates TLS using an ACM certificate. HTTP (port 80) is redirected to HTTPS (port 443). ECS tasks are only reachable from the ALB security group on port 3000.
5. Least-privilege IAM = Only the permissions needed to pull images, write logs, and read SSM parameters, Following the principle of least-privilege.

### CI/CD 

1. GitHub Actions = Native integration with the repository, free for public repos, and supports environment-based approvals.
2. Build on PR, deploy on push to main = Pull requests are validated without deploying. Only merged code on `main` triggers a production deployment, keeping the main branch as the single source of truth.
3. Manual approval gate = The `production` environment requires a reviewer to approve before the deploy job runs, preventing accidental or unreviewed changes from reaching production.
4. Image tagging with Git SHA = Docker images are tagged with the Git commit SHA for full traceability. A `latest` tag is also pushed for convenience.

### Infrastructure

1. ECS Fargate over EC2 = Serverless compute eliminates the need to manage, patch, and scale EC2 instances. It reduces operational overhead and scales automatically based on demand.
2. Rolling deployment over blue-green = Simpler to configure and sufficient for this application's scale. Achieves zero downtime by keeping healthy tasks running while new ones are launched and health-checked.
3. Terraform for IaC = Infrastructure changes are version-controlled, reviewable, and reproducible across environments.
4. ALB health checcks = The ALB continuously probes `/health` on port 3000. Unhealthy tasks are automatically deregistered and replaced by ECS, ensuring only healthy containers serve traffic.
5. VPC with public and private subnets = ECS tasks run in private subnets behind a NAT gateway for outbound access. Only the ALB sits in public subnets, minimizing the attack surface of the compute layer.
