# Kubernetes Manifests for E-commerce Microservices

This directory contains all the Kubernetes manifests needed to deploy the complete e-commerce microservices platform to production.

## 📁 Directory Structure

```
k8s-manifests/
├── namespace.yaml                    # E-commerce namespace
├── configmaps/                       # Application configuration
│   └── app-config.yaml
├── secrets/                          # Sensitive configuration
│   └── app-secrets.yaml
├── deployments/                      # Application deployments
│   ├── gateway-deployment.yaml
│   ├── auth-deployment.yaml
│   ├── product-deployment.yaml
│   ├── order-deployment.yaml
│   ├── payment-deployment.yaml
│   ├── search-deployment.yaml
│   └── infrastructure-deployments.yaml
├── services/                         # Kubernetes services
│   ├── gateway-service.yaml
│   ├── microservices-services.yaml
│   └── infrastructure-services.yaml
├── persistent-volumes/               # Storage configuration
│   └── persistent-volumes.yaml
├── ingress/                          # Ingress configuration
│   └── ingress.yaml
├── monitoring/                       # Monitoring stack
│   ├── prometheus-deployment.yaml
│   ├── prometheus-config.yaml
│   └── grafana-config.yaml
└── deploy-all.sh                     # Deployment script
```

## 🚀 Quick Deployment

### Prerequisites

1. **Kubernetes Cluster**: EKS, GKE, AKS, or local (minikube/kind)
2. **kubectl**: Configured to access your cluster
3. **Docker Images**: Built and pushed to your registry
4. **Storage Class**: Available in your cluster (e.g., `gp2` for AWS)

### 1. Update Image References

Replace `your-registry` with your actual container registry:

```bash
# Example for AWS ECR
sed -i 's/your-registry/123456789012.dkr.ecr.us-west-2.amazonaws.com/g' deployments/*.yaml

# Example for Docker Hub
sed -i 's/your-registry/your-dockerhub-username/g' deployments/*.yaml
```

### 2. Update Secrets

Edit `secrets/app-secrets.yaml` with your actual values:

```bash
# Generate base64 encoded secrets
echo -n "your-jwt-secret" | base64
echo -n "mongodb://mongodb:27017/ecommerce" | base64
echo -n "your-stripe-secret-key" | base64
# ... etc
```

### 3. Deploy Everything

```bash
# Make script executable
chmod +x deploy-all.sh

# Run deployment
./deploy-all.sh
```

## 🔧 Manual Deployment Steps

If you prefer to deploy manually:

### 1. Create Namespace
```bash
kubectl apply -f namespace.yaml
```

### 2. Apply Configuration
```bash
kubectl apply -f configmaps/
kubectl apply -f secrets/
```

### 3. Deploy Infrastructure
```bash
kubectl apply -f persistent-volumes/
kubectl apply -f deployments/infrastructure-deployments.yaml
kubectl apply -f services/infrastructure-services.yaml
```

### 4. Deploy Microservices
```bash
kubectl apply -f deployments/
kubectl apply -f services/microservices-services.yaml
```

### 5. Deploy Monitoring
```bash
kubectl apply -f monitoring/
```

### 6. Deploy Ingress (Optional)
```bash
kubectl apply -f ingress/
```

## 📊 Monitoring & Observability

### Access Monitoring Dashboards

```bash
# Port forward Grafana
kubectl port-forward svc/grafana-service 3000:3000 -n ecommerce

# Port forward Prometheus
kubectl port-forward svc/prometheus-service 9090:9090 -n ecommerce
```

### Grafana Dashboard
- **URL**: http://localhost:3000
- **Username**: admin
- **Password**: admin

### Prometheus
- **URL**: http://localhost:9090

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Install cert-manager**:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

2. **Create ClusterIssuer**:
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

3. **Update Ingress** with your domain:
```yaml
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    secretName: ecommerce-tls
  rules:
  - host: api.yourdomain.com
```

## 📈 Scaling Configuration

### Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: gateway-hpa
  namespace: ecommerce
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Vertical Pod Autoscaler (VPA)

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: gateway-vpa
  namespace: ecommerce
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: gateway
  updatePolicy:
    updateMode: "Auto"
```

## 🗄️ Database Configuration

### MongoDB Atlas (Recommended for Production)

Update the MongoDB URI in `secrets/app-secrets.yaml`:

```yaml
MONGODB_URI: "mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority"
```

### Redis Cloud (Optional)

Update Redis configuration for external Redis:

```yaml
REDIS_HOST: "your-redis-host"
REDIS_PORT: "6379"
REDIS_PASSWORD: "your-redis-password"
```

## 🔍 Troubleshooting

### Common Issues

1. **Pods not starting**:
```bash
kubectl describe pod <pod-name> -n ecommerce
kubectl logs <pod-name> -n ecommerce
```

2. **Services not accessible**:
```bash
kubectl get endpoints -n ecommerce
kubectl describe service <service-name> -n ecommerce
```

3. **Persistent volumes not bound**:
```bash
kubectl get pvc -n ecommerce
kubectl describe pvc <pvc-name> -n ecommerce
```

4. **Ingress not working**:
```bash
kubectl get ingress -n ecommerce
kubectl describe ingress ecommerce-ingress -n ecommerce
```

### Health Checks

```bash
# Check all pods
kubectl get pods -n ecommerce

# Check services
kubectl get services -n ecommerce

# Check deployments
kubectl get deployments -n ecommerce

# Check persistent volumes
kubectl get pvc -n ecommerce
```

## 🧹 Cleanup

To remove all resources:

```bash
# Delete everything in the namespace
kubectl delete namespace ecommerce

# Or delete specific resources
kubectl delete -f k8s-manifests/ -n ecommerce
```

## 🔄 Updates and Rollouts

### Rolling Updates

```bash
# Update a deployment
kubectl set image deployment/gateway gateway=your-registry/ecommerce-gateway:v2.0.0 -n ecommerce

# Check rollout status
kubectl rollout status deployment/gateway -n ecommerce

# Rollback if needed
kubectl rollout undo deployment/gateway -n ecommerce
```

### Blue-Green Deployment

```bash
# Create new deployment with different image
kubectl apply -f deployments/gateway-deployment-v2.yaml

# Switch traffic
kubectl patch service gateway-service -p '{"spec":{"selector":{"version":"v2"}}}'
```

## 📋 Resource Requirements

### Minimum Cluster Requirements

- **CPU**: 8 cores
- **Memory**: 16GB RAM
- **Storage**: 100GB
- **Nodes**: 3+ worker nodes

### Recommended Production Requirements

- **CPU**: 16+ cores
- **Memory**: 32GB+ RAM
- **Storage**: 500GB+ SSD
- **Nodes**: 5+ worker nodes across availability zones

## 🔐 Security Best Practices

1. **Use RBAC** for service accounts
2. **Enable Pod Security Standards**
3. **Use Network Policies** to restrict traffic
4. **Scan images** for vulnerabilities
5. **Rotate secrets** regularly
6. **Enable audit logging**

## 📊 Performance Optimization

1. **Resource Limits**: Set appropriate CPU/memory limits
2. **Pod Disruption Budgets**: Ensure high availability
3. **Anti-Affinity**: Spread pods across nodes
4. **Pod Priority**: Set appropriate priorities
5. **Resource Quotas**: Limit namespace resources

## 🆘 Support

For issues with Kubernetes deployment:

1. Check the troubleshooting section above
2. Review pod logs and events
3. Verify network connectivity between services
4. Check resource availability
5. Validate configuration files

---

**Happy Deploying! 🚀** 