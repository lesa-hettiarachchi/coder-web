# 🧪 Testing Guide for Coder Web

This guide covers all testing requirements for your project submission.

## 📋 **Testing Requirements Checklist**

### ✅ **Playwright E2E Tests (2 points)**
- [x] Escape Room game functionality tests
- [x] Tab management tests
- [x] Timer and scoring tests
- [x] User interaction tests

### ✅ **Lighthouse Performance Tests (1.5 points)**
- [x] Performance scoring
- [x] Accessibility testing
- [x] Best practices validation
- [x] SEO optimization

### ✅ **JMeter Load Tests (1.5 points)**
- [x] Load testing configuration
- [x] Performance under stress
- [x] Response time analysis
- [x] Concurrent user simulation

## 🚀 **Running Tests**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Playwright E2E Tests**
```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

### **3. Lighthouse Performance Tests**
```bash
# Start the application
npm run dev

# In another terminal, run Lighthouse
npm run lighthouse
```

### **4. JMeter Load Tests**
```bash
# Install JMeter (if not installed)
# Download from: https://jmeter.apache.org/download_jmeter.cgi

# Run JMeter test
jmeter -n -t scripts/jmeter-test.jmx -l results.jtl -e -o report/
```

## 📊 **Test Results**

### **Expected Playwright Results**
- ✅ All escape room functionality works
- ✅ Timer counts down correctly
- ✅ Scoring system functions
- ✅ Tab management works
- ✅ User can complete full game flow

### **Expected Lighthouse Scores**
- **Performance**: 80+ (optimized for production)
- **Accessibility**: 90+ (ARIA labels, keyboard navigation)
- **Best Practices**: 85+ (security headers, modern practices)
- **SEO**: 90+ (meta tags, structured data)

### **Expected JMeter Results**
- **Response Time**: < 200ms average
- **Throughput**: 100+ requests/second
- **Error Rate**: < 1%
- **Concurrent Users**: 50+ users supported

## 🎥 **Video Demonstration Requirements**

### **Required Video Content**
1. **Playwright Test Demo** (2-3 minutes)
   - Show test execution
   - Demonstrate test results
   - Explain test coverage

2. **Lighthouse Report Demo** (1-2 minutes)
   - Show performance scores
   - Explain optimizations
   - Discuss improvements

3. **JMeter Load Test Demo** (2-3 minutes)
   - Show load test execution
   - Display performance metrics
   - Explain scalability

4. **Family/Friends/Industry Feedback** (2-3 minutes)
   - User testing sessions
   - Feedback collection
   - Improvement iterations

## 📈 **Performance Optimization**

### **Lighthouse Optimizations Applied**
- ✅ **Image Optimization**: Next.js automatic optimization
- ✅ **Code Splitting**: Dynamic imports
- ✅ **Caching**: Static asset caching
- ✅ **Compression**: Gzip compression
- ✅ **Minification**: Production build optimization

### **JMeter Load Test Scenarios**
- **Scenario 1**: 50 concurrent users, 10 iterations
- **Scenario 2**: Ramp-up over 60 seconds
- **Scenario 3**: Test multiple endpoints
- **Scenario 4**: Measure response times

## 🔧 **Test Configuration**

### **Playwright Configuration**
```typescript
// __tests__/playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
```

### **Lighthouse Configuration**
```javascript
// scripts/lighthouse.js
const options = {
  logLevel: 'info',
  output: 'html',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  port: chrome.port,
};
```

### **JMeter Configuration**
- **Threads**: 50 users
- **Ramp-up**: 60 seconds
- **Loop Count**: 10 iterations
- **Test Duration**: 10 minutes

## 📝 **Test Reports**

### **Generated Reports**
- `playwright-report/` - Playwright HTML report
- `lighthouse-report.html` - Lighthouse performance report
- `jmeter-report/` - JMeter load test report
- `results.jtl` - JMeter raw results

### **Report Analysis**
1. **Playwright**: Check test pass/fail rates
2. **Lighthouse**: Analyze performance scores
3. **JMeter**: Review response times and throughput

## 🎯 **Success Criteria**

### **Minimum Requirements**
- **Playwright**: 100% test pass rate
- **Lighthouse Performance**: 70+ score
- **JMeter**: < 500ms average response time
- **Video**: Complete demonstration of all tests

### **Target Goals**
- **Playwright**: 100% test pass rate
- **Lighthouse Performance**: 85+ score
- **JMeter**: < 200ms average response time
- **Video**: Professional presentation with clear explanations

## 🚀 **Quick Start Testing**

```bash
# 1. Install all dependencies
npm install
npx playwright install

# 2. Start the application
npm run dev

# 3. Run all tests (in separate terminals)
npm run test:e2e
npm run lighthouse
jmeter -n -t scripts/jmeter-test.jmx -l results.jtl -e -o report/

# 4. View reports
open playwright-report/index.html
open lighthouse-report.html
open report/index.html
```

## 📞 **Troubleshooting**

### **Common Issues**
1. **Playwright tests fail**: Check if app is running on port 3000
2. **Lighthouse fails**: Ensure Chrome is installed
3. **JMeter fails**: Verify JMeter is properly installed

### **Debug Commands**
```bash
# Debug Playwright
npx playwright test --debug

# Debug Lighthouse
node scripts/lighthouse.js --verbose

# Debug JMeter
jmeter -n -t scripts/jmeter-test.jmx -l results.jtl -j debug.log
```

---

**Your testing setup is complete and ready for demonstration! 🎉**

