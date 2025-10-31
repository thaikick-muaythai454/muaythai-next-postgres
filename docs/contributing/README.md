# คู่มือการมีส่วนร่วม

ยินดีต้อนรับสู่คู่มือการมีส่วนร่วมในการพัฒนาโปรเจกต์ Muay Thai Next.js + Supabase

## 🎯 ภาพรวม

เราต้อนรับการมีส่วนร่วมจากนักพัฒนาทุกระดับ ไม่ว่าจะเป็นการแก้ไขบั๊ก การเพิ่มฟีเจอร์ใหม่ การปรับปรุงเอกสาร หรือการทดสอบ

## 🚀 การเริ่มต้น

### 1. Setup Development Environment

```bash
# 1. Fork และ clone repository
git clone https://github.com/your-username/muaythai-next-postgres.git
cd muaythai-next-postgres

# 2. ติดตั้ง dependencies
npm install

# 3. ตั้งค่า environment variables
cp .env.example .env.local
# แก้ไขค่าใน .env.local

# 4. ตั้งค่าฐานข้อมูลและสภาพแวดล้อม
./scripts/development-setup.sh

# 5. รันโปรเจกต์
npm run dev
```

### 2. ตรวจสอบการติดตั้ง

```bash
# ตรวจสอบสภาพแวดล้อม
./scripts/development-setup.sh --check-only

# ตรวจสอบฐานข้อมูล
node scripts/database-utilities.js check

# รันเทส
npm run test:e2e
node tests/scripts/run-all-tests.js
```

## 📋 Code Standards

### TypeScript Guidelines

```typescript
// ✅ Good: ใช้ interface สำหรับ object types
interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

// ✅ Good: ใช้ type สำหรับ union types
type UserRole = 'user' | 'partner' | 'admin';

// ✅ Good: ใช้ generic types
interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ❌ Bad: ใช้ any
function processData(data: any) {
  return data.something;
}

// ✅ Good: ใช้ proper typing
function processUser(user: User): string {
  return user.email;
}
```

### React Component Guidelines

```typescript
// ✅ Good: Functional component with proper typing
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}

// ✅ Good: Custom hooks
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Authentication logic
  }, []);

  return { user, loading };
}
```

### CSS/Tailwind Guidelines

```typescript
// ✅ Good: Organized class names
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      bg-white 
      rounded-lg 
      shadow-md 
      p-6 
      hover:shadow-lg 
      transition-shadow 
      duration-200
    ">
      {children}
    </div>
  );
}

// ✅ Good: Responsive design
export function GymGrid({ gyms }: { gyms: Gym[] }) {
  return (
    <div className="
      grid 
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-3 
      xl:grid-cols-4 
      gap-6
    ">
      {gyms.map(gym => (
        <GymCard key={gym.id} gym={gym} />
      ))}
    </div>
  );
}
```

### Database Guidelines

```sql
-- ✅ Good: Descriptive table and column names
CREATE TABLE gym_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ Good: Proper indexes
CREATE INDEX idx_gym_packages_gym_id ON gym_packages(gym_id);
CREATE INDEX idx_gym_packages_active ON gym_packages(is_active) WHERE is_active = true;

-- ✅ Good: RLS policies with clear names
CREATE POLICY "Users can view active gym packages" ON gym_packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage their gym packages" ON gym_packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM gyms 
            WHERE gyms.id = gym_packages.gym_id 
            AND gyms.owner_id = auth.uid()
        )
    );
```

## 🔄 Git Workflow

### Branch Naming Convention

```bash
# Feature branches
feature/user-authentication
feature/gym-management
feature/payment-integration

# Bug fixes
bugfix/login-error
bugfix/payment-validation

# Hotfixes
hotfix/security-patch
hotfix/critical-bug

# Documentation
docs/api-documentation
docs/setup-guide

# Refactoring
refactor/database-queries
refactor/component-structure
```

### Commit Message Format

```bash
# Format: <type>(<scope>): <description>

# Types:
feat: เพิ่มฟีเจอร์ใหม่
fix: แก้ไขบั๊ก
docs: อัพเดทเอกสาร
style: แก้ไข formatting, ไม่เปลี่ยนโค้ด
refactor: ปรับปรุงโค้ดโดยไม่เปลี่ยนฟังก์ชัน
test: เพิ่มหรือแก้ไขเทส
chore: งานบำรุงรักษา

# Examples:
feat(auth): add email verification
fix(booking): resolve date validation issue
docs(api): update authentication endpoints
style(components): format button component
refactor(database): optimize gym queries
test(e2e): add booking flow tests
chore(deps): update dependencies
```

### Pull Request Process

1. **สร้าง branch ใหม่:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **พัฒนาและทดสอบ:**
   ```bash
   # พัฒนาฟีเจอร์
   # รันเทสเพื่อให้แน่ใจว่าไม่มีอะไรพัง
   npm run test:e2e
   node tests/scripts/run-all-tests.js
   
   # ตรวจสอบ linting
   npm run lint
   npm run type-check
   ```

3. **Commit และ push:**
   ```bash
   git add .
   git commit -m "feat(feature): add new feature"
   git push origin feature/your-feature-name
   ```

4. **สร้าง Pull Request:**
   - ใช้ template ที่กำหนด
   - อธิบายการเปลี่ยนแปลงอย่างชัดเจน
   - แนบ screenshots หากเป็นการเปลี่ยนแปลง UI
   - ระบุ issue ที่เกี่ยวข้อง

### Pull Request Template

```markdown
## 📋 Description
Brief description of changes

## 🔄 Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## 🧪 Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## 📷 Screenshots (if applicable)
Add screenshots here

## 📝 Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No console.log statements left in code
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// tests/unit/utils/validation.test.ts
import { validateEmail, validatePhone } from '@/lib/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email+tag@domain.co.th')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });
  });
});
```

### E2E Tests

```typescript
// tests/e2e/booking.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should complete booking successfully', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user@muaythai.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to gym
    await page.goto('/gyms/test-gym');
    
    // Select package
    await page.click('[data-testid="package-card"]:first-child');
    
    // Fill booking form
    await page.fill('[data-testid="start-date"]', '2024-12-01');
    await page.click('[data-testid="book-now"]');
    
    // Verify booking creation
    await expect(page).toHaveURL(/\/bookings\/\w+/);
    await expect(page.locator('[data-testid="booking-status"]')).toContainText('Pending');
  });
});
```

### Script Tests

```javascript
// tests/scripts/custom-feature.test.js
export async function testCustomFeature() {
  console.log('🧪 Testing custom feature...');
  
  try {
    // Test implementation
    const result = await customFeatureFunction();
    
    if (result.success) {
      console.log('✅ Custom feature test passed');
      return true;
    } else {
      console.log('❌ Custom feature test failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('❌ Custom feature test error:', error.message);
    return false;
  }
}
```

## 📝 Documentation Guidelines

### Code Documentation

```typescript
/**
 * Creates a new booking for a gym package
 * 
 * @param userId - The ID of the user making the booking
 * @param packageId - The ID of the gym package being booked
 * @param startDate - The start date of the booking
 * @param options - Additional booking options
 * @returns Promise resolving to the created booking
 * 
 * @throws {ValidationError} When input data is invalid
 * @throws {AuthorizationError} When user is not authorized
 * 
 * @example
 * ```typescript
 * const booking = await createBooking(
 *   'user-123',
 *   'package-456',
 *   new Date('2024-12-01'),
 *   { notes: 'Special requirements' }
 * );
 * ```
 */
export async function createBooking(
  userId: string,
  packageId: string,
  startDate: Date,
  options?: BookingOptions
): Promise<Booking> {
  // Implementation
}
```

### API Documentation

```typescript
/**
 * @api {post} /api/bookings Create Booking
 * @apiName CreateBooking
 * @apiGroup Bookings
 * @apiVersion 1.0.0
 * 
 * @apiDescription Creates a new booking for a gym package
 * 
 * @apiHeader {String} Authorization Bearer JWT token
 * @apiHeader {String} Content-Type application/json
 * 
 * @apiParam {String} gym_package_id ID of the gym package
 * @apiParam {String} start_date Start date (YYYY-MM-DD)
 * @apiParam {String} [notes] Optional booking notes
 * 
 * @apiSuccess {Object} booking Created booking object
 * @apiSuccess {String} booking.id Booking ID
 * @apiSuccess {String} booking.status Booking status
 * @apiSuccess {Number} booking.total_amount Total amount
 * 
 * @apiError {Object} 400 Bad Request - Invalid input data
 * @apiError {Object} 401 Unauthorized - Invalid or missing token
 * @apiError {Object} 404 Not Found - Gym package not found
 * 
 * @apiExample {curl} Example usage:
 * curl -X POST \
 *   http://localhost:3000/api/bookings \
 *   -H 'Authorization: Bearer <token>' \
 *   -H 'Content-Type: application/json' \
 *   -d '{
 *     "gym_package_id": "package-123",
 *     "start_date": "2024-12-01",
 *     "notes": "First time booking"
 *   }'
 */
```

## 🐛 Bug Reports

### Bug Report Template

```markdown
## 🐛 Bug Description
Clear and concise description of the bug

## 🔄 Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## 🎯 Expected Behavior
What you expected to happen

## 📷 Screenshots
If applicable, add screenshots

## 🖥️ Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]
- Device: [e.g. Desktop, Mobile]

## 📝 Additional Context
Any other context about the problem
```

### Security Issues

สำหรับปัญหาด้านความปลอดภัย:
1. **ไม่ควร** เปิด public issue
2. ส่งอีเมลไปที่ security@yourproject.com
3. รอการตอบกลับก่อนเปิดเผยข้อมูล

## 💡 Feature Requests

### Feature Request Template

```markdown
## 🚀 Feature Description
Clear and concise description of the feature

## 🎯 Problem Statement
What problem does this feature solve?

## 💡 Proposed Solution
Describe your proposed solution

## 🔄 Alternatives Considered
Alternative solutions you've considered

## 📋 Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## 🎨 Mockups/Wireframes
If applicable, add visual mockups

## 📊 Impact Assessment
- User impact: High/Medium/Low
- Technical complexity: High/Medium/Low
- Priority: High/Medium/Low
```

## 🔍 Code Review Guidelines

### For Reviewers

1. **ตรวจสอบ functionality:**
   - โค้ดทำงานตามที่คาดหวังหรือไม่?
   - มีการจัดการ edge cases หรือไม่?
   - Performance เป็นอย่างไร?

2. **ตรวจสอบ code quality:**
   - โค้ดอ่านง่ายและเข้าใจง่ายหรือไม่?
   - มีการใช้ naming convention ที่ดีหรือไม่?
   - มี comments ที่จำเป็นหรือไม่?

3. **ตรวจสอบ security:**
   - มีการ validate input หรือไม่?
   - มีการจัดการ authentication/authorization หรือไม่?
   - มีช่องโหว่ด้านความปลอดภัยหรือไม่?

4. **ตรวจสอบ testing:**
   - มีเทสที่เพียงพอหรือไม่?
   - เทสครอบคลุม edge cases หรือไม่?

### For Authors

1. **เตรียม PR ให้พร้อม:**
   - รันเทสทั้งหมดให้ผ่าน
   - ตรวจสอบ linting และ formatting
   - เขียน description ที่ชัดเจน

2. **ตอบกลับ feedback:**
   - ตอบกลับอย่างสร้างสรรค์
   - อธิบายเหตุผลหากไม่เห็นด้วย
   - ขอคำแนะนำเพิ่มเติมหากจำเป็น

## 📚 Learning Resources

### Project-Specific Resources
- [Architecture Overview](../architecture/README.md)
- [Database Scripts Guide](../database/README.md)
- [Testing Guide](../testing/README.md)
- [Feature Documentation](../features/README.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Playwright Documentation](https://playwright.dev/docs/intro)

## 🏆 Recognition

เราให้ความสำคัญกับการมีส่วนร่วมทุกรูปแบบ:

### Types of Contributions
- 💻 **Code**: การเขียนโค้ด, แก้ไขบั๊ก
- 📖 **Documentation**: การเขียนและปรับปรุงเอกสาร
- 🧪 **Testing**: การเขียนเทสและ QA
- 🎨 **Design**: การออกแบบ UI/UX
- 💡 **Ideas**: การเสนอแนะนำและ feedback
- 🐛 **Bug Reports**: การรายงานบั๊ก
- 📢 **Community**: การช่วยเหลือผู้ใช้อื่น

### Contributors Recognition
- รายชื่อใน README.md
- Contributor badge ใน GitHub profile
- การกล่าวถึงใน release notes
- การเชิญเข้าร่วม maintainer team (สำหรับ active contributors)

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: สำหรับ bug reports และ feature requests
- **GitHub Discussions**: สำหรับคำถามและการสนทนา
- **Email**: สำหรับเรื่องส่วนตัวหรือความปลอดภัย

### Response Times
- **Bug reports**: 1-3 วันทำการ
- **Feature requests**: 1 สัปดาห์
- **Pull requests**: 2-5 วันทำการ
- **Security issues**: 24 ชั่วโมง

## 📋 Checklist สำหรับ Contributors

### Before Starting
- [ ] อ่านเอกสารนี้ทั้งหมด
- [ ] ตั้งค่า development environment
- [ ] รันเทสเพื่อให้แน่ใจว่าทุกอย่างทำงาน
- [ ] ทำความเข้าใจ codebase

### During Development
- [ ] ทำงานใน feature branch
- [ ] เขียนเทสสำหรับโค้ดใหม่
- [ ] ปฏิบัติตาม coding standards
- [ ] อัพเดทเอกสารหากจำเป็น

### Before Submitting PR
- [ ] รันเทสทั้งหมดให้ผ่าน
- [ ] ตรวจสอบ linting และ formatting
- [ ] เขียน commit messages ที่ดี
- [ ] เขียน PR description ที่ชัดเจน

### After Submitting PR
- [ ] ตอบกลับ review comments
- [ ] แก้ไขตาม feedback
- [ ] อัพเดท PR หากจำเป็น

---

ขอบคุณที่สนใจมีส่วนร่วมในการพัฒนาโปรเจกต์! การมีส่วนร่วมของคุณช่วยให้โปรเจกต์นี้ดีขึ้นสำหรับทุกคน 🙏