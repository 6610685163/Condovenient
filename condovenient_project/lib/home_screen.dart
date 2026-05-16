import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'login_screen.dart';
import 'repair_screen.dart';
import 'fees_screen.dart';
import 'parcel_screen.dart';
import 'visitor_screen.dart';

class HomeScreen extends StatefulWidget {
  final String userName;
  final String userRole;
  final String userId;

  const HomeScreen({
    super.key,
    required this.userName,
    this.userRole = 'Resident',
    this.userId = '',
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  void _handleLogout() async {
    bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('ออกจากระบบ'),
        content: const Text('คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('ยกเลิก'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('ยืนยัน', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await FirebaseAuth.instance.signOut();
        await GoogleSignIn().signOut();

        if (mounted) {
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (context) => const LoginScreen()),
            (route) => false,
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text('เกิดข้อผิดพลาด: $e')));
        }
      }
    }
  }

  // --- 1. ฟังก์ชันเลือกหน้าจอที่จะแสดง ---
 Widget _getSelectedPage() {
    switch (_selectedIndex) {
      case 0:
        return _buildHomeTab();
      case 1:
        return FeesScreen(userId: widget.userId, roomId: widget.userId);
      case 2:
        return RepairScreen(userId: widget.userId, roomNumber: widget.userRole);
      case 3:
        return const ParcelScreen();
      case 4:
        return VisitorScreen(userId: widget.userId, roomNumber: widget.userRole);
      default:
        return _buildHomeTab();
    }
  }

  // --- 2. ดึงหน้า Home เดิมมาใส่ฟังก์ชันนี้ ---
  Widget _buildHomeTab() {
    return SingleChildScrollView(
      child: Column(
        children: [
          _buildHeaderSection(),
          const SizedBox(height: 24),
          _buildQuickActions(),
          const SizedBox(height: 24),
          _buildUnitInfo(),
          const SizedBox(height: 24),
          _buildImportantSchedule(),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  // --- 3. สร้างหน้าเปล่าๆ ชั่วคราว (Placeholder) สำหรับแท็บอื่น ---
  Widget _buildPlaceholderTab(String title, IconData icon, Color color) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 80, color: color.withOpacity(0.5)),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'กำลังอยู่ในขั้นตอนการพัฒนา',
            style: TextStyle(color: Colors.grey),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      // --- 4. เรียกใช้ฟังก์ชันเลือกหน้ามาใส่ตรง body ---
      body: _getSelectedPage(),

      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.blue[700],
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long),
            label: 'Fees',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.build), label: 'Repair'),
          BottomNavigationBarItem(
            icon: Icon(Icons.inventory_2),
            label: 'Parcel',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.person_add), label: 'Visitor'),
        ],
      ),
    );
  }

  // ==========================================
  // ส่วน UI ด้านล่างนี้คือของเดิมที่คุณทำไว้ได้ดีอยู่แล้วครับ
  // ==========================================

  Widget _buildHeaderSection() {
    return Stack(
      children: [
        Container(
          height: 280,
          padding: const EdgeInsets.only(top: 60, left: 24, right: 24),
          decoration: BoxDecoration(
            color: Colors.blue[600],
            borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(30),
              bottomRight: Radius.circular(30),
            ),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.white.withOpacity(0.2),
                        child: Text(
                          widget.userName.isNotEmpty
                              ? widget.userName[0].toUpperCase()
                              : '?',
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Welcome back,',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                            ),
                          ),
                          Text(
                            widget.userName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(
                          Icons.notifications_outlined,
                          color: Colors.white,
                        ),
                      ),
                      IconButton(
                        onPressed: _handleLogout,
                        icon: const Icon(Icons.logout, color: Colors.white),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
        _buildInvoiceCard(),
      ],
    );
  }

  Widget _buildInvoiceCard() {
    return Container(
      margin: const EdgeInsets.only(top: 130, left: 24, right: 24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Outstanding Common Fee',
                style: TextStyle(color: Colors.grey),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.error_outline, size: 14, color: Colors.red),
                    SizedBox(width: 4),
                    Text(
                      'Unpaid',
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'THB 5,250',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Due: Feb 15, 2026',
                style: TextStyle(color: Colors.grey, fontSize: 12),
              ),
              TextButton(
                onPressed: () {
                  // สามารถสั่งให้เปลี่ยนแท็บจากปุ่มนี้ได้ด้วย
                  setState(() => _selectedIndex = 1); // ไปแท็บ Fees
                },
                child: Row(
                  children: const [
                    Text('View Details'),
                    Icon(Icons.chevron_right, size: 16),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Quick Actions',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildActionButton(Icons.payment, 'Pay Fee', Colors.blue, 1),
              _buildActionButton(
                Icons.build_rounded,
                'Repair',
                Colors.orange,
                2,
              ),
              _buildActionButton(
                Icons.inventory_2_rounded,
                'Parcel',
                Colors.green,
                3,
              ),
              _buildActionButton(
                Icons.person_add_rounded,
                'Visitor',
                Colors.teal,
                4,
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ปรับให้ปุ่ม Quick Action รับค่า index ปลายทาง เพื่อกดแล้วลิงก์ไปแท็บอื่นได้เลย
  Widget _buildActionButton(
    IconData icon,
    String label,
    Color color,
    int targetIndex,
  ) {
    return GestureDetector(
      onTap: () {
        setState(() => _selectedIndex = targetIndex);
      },
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildUnitInfo() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Your Unit',
                  style: TextStyle(color: Colors.grey, fontSize: 12),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Building A, Unit 1234',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                widget.userRole,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.black54,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- ส่วนใหม่: ตารางกำหนดการสำคัญ (Important Schedule) ---
  Widget _buildImportantSchedule() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'กำหนดการสำคัญ',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              TextButton(onPressed: () {}, child: const Text('ดูปฏิทิน')),
            ],
          ),
          const SizedBox(height: 8),
          // รายการกำหนดการ
          _buildScheduleItem(
            'งดจ่ายกระแสไฟฟ้าชั่วคราว',
            '10 เม.ย. 2026 | 09:00 - 12:00',
            'อาคาร A และ พื้นที่ส่วนกลาง',
            Icons.flash_off_rounded,
            Colors.orange,
          ),
          _buildScheduleItem(
            'ฉีดพ่นยากำจัดแมลง',
            '12 เม.ย. 2026 | 13:00 เป็นต้นไป',
            'ทุกยูนิต และสวนหย่อม',
            Icons.bug_report_outlined,
            Colors.green,
          ),
          _buildScheduleItem(
            'ตรวจสอบระบบดับเพลิงประจำปี',
            '15 เม.ย. 2026 | 10:00 - 15:00',
            'ทุกพื้นที่ภายในโครงการ',
            Icons.fire_extinguisher_rounded,
            Colors.red,
          ),
        ],
      ),
    );
  }

  // Widget ย่อยสำหรับแต่ละรายการในตารางเวลา
  Widget _buildScheduleItem(
    String title,
    String time,
    String location,
    IconData icon,
    Color color,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            // แถบสีด้านซ้ายบอกความสำคัญ
            Container(
              width: 6,
              decoration: BoxDecoration(
                color: color,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  bottomLeft: Radius.circular(16),
                ),
              ),
            ),
            const SizedBox(width: 16),
            // ไอคอนและรายละเอียด
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  vertical: 16,
                  horizontal: 8,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(icon, size: 18, color: color),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            title,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(
                          Icons.access_time,
                          size: 14,
                          color: Colors.grey,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          time,
                          style: const TextStyle(
                            color: Colors.black87,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          size: 14,
                          color: Colors.grey,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          location,
                          style: const TextStyle(
                            color: Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey),
            const SizedBox(width: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationItem(String title, String time, Color dotColor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[50]!.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  time,
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
