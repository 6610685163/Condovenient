import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'login_screen.dart';
import 'repair_screen.dart';
import 'fees_screen.dart';
import 'parcel_screen.dart';
import 'visitor_screen.dart';

class HomeScreen extends StatefulWidget {
  final String userName;
  final String userRole;
  final String userId;
  final String roomNumber; // เพิ่ม roomNumber จาก backend

  const HomeScreen({
    super.key,
    required this.userName,
    this.userRole = 'Resident',
    this.userId = '',
    this.roomNumber = '',
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  int _unreadCount = 0;
  Timer? _notifTimer;
  final String _backendUrl = 'http://10.0.2.2:3000';

  // Invoice summary สำหรับหน้า Home
  double _totalUnpaid = 0;
  String _dueDateStr = '-';
  bool _invoiceLoaded = false;

  @override
  void initState() {
    super.initState();
    _fetchUnreadCount();
    _fetchInvoiceSummary();
    _notifTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _fetchUnreadCount();
      _fetchInvoiceSummary();
    });
  }

  @override
  void dispose() {
    _notifTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchUnreadCount() async {
    if (widget.userId.isEmpty) return;
    try {
      final response = await http.get(
        Uri.parse('$_backendUrl/api/auth/notifications/${widget.userId}'),
      ).timeout(const Duration(seconds: 8));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true && mounted) {
          final notifs = List<dynamic>.from(data['notifications'] ?? []);
          setState(() {
            _unreadCount = notifs.where((n) => n['isRead'] == false).length;
          });
        }
      }
    } catch (_) {}
  }

  // ดึง invoice summary เพื่อแสดงบนหน้า Home
  Future<void> _fetchInvoiceSummary() async {
    // ถ้าไม่มี userId หยุด spinner ทันที ไม่ต้อง request
    if (widget.userId.isEmpty) {
      if (mounted) setState(() => _invoiceLoaded = true);
      return;
    }
    try {
      final response = await http.get(
        Uri.parse('$_backendUrl/api/payment/invoices/${widget.userId}'),
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final invoices = List<Map<String, dynamic>>.from(data['invoices'] ?? []);
        final unpaid = invoices.where((inv) => inv['status'] == 'pending').toList();

        double total = unpaid.fold(
          0.0,
          (sum, inv) => sum + ((inv['amount'] ?? 0) as num).toDouble(),
        );

        String dueDate = '-';
        if (unpaid.isNotEmpty) {
          final raw = unpaid.first['dueDate'] ?? '';
          if (raw.isNotEmpty) {
            try {
              final dt = DateTime.tryParse(raw);
              if (dt != null) {
                const months = [
                  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ];
                dueDate = '${months[dt.month]} ${dt.day}, ${dt.year}';
              } else {
                dueDate = raw;
              }
            } catch (_) {
              dueDate = raw;
            }
          }
        }

        if (mounted) {
          setState(() {
            _totalUnpaid = total;
            _dueDateStr = dueDate;
            _invoiceLoaded = true; // หยุด spinner
          });
        }
      } else {
        // HTTP error → หยุด spinner แสดงยอด 0
        if (mounted) setState(() => _invoiceLoaded = true);
      }
    } catch (_) {
      // Network error / timeout → หยุด spinner แสดงยอด 0
      if (mounted) setState(() => _invoiceLoaded = true);
    }
  }

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
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('เกิดข้อผิดพลาด: $e')),
          );
        }
      }
    }
  }

  Widget _getSelectedPage() {
    switch (_selectedIndex) {
      case 0:
        return _buildHomeTab();
      case 1:
        // ส่ง roomNumber ที่ถูกต้องไปยัง FeesScreen
        return FeesScreen(userId: widget.userId, roomId: widget.roomNumber);
      case 2:
        return RepairScreen(userId: widget.userId, roomNumber: widget.roomNumber);
      case 3:
        return ParcelScreen(userId: widget.userId);
      case 4:
        return VisitorScreen(userId: widget.userId, roomNumber: widget.roomNumber);
      default:
        return _buildHomeTab();
    }
  }

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      body: _getSelectedPage(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.blue[700],
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        items: [
          const BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          const BottomNavigationBarItem(icon: Icon(Icons.receipt_long), label: 'Fees'),
          const BottomNavigationBarItem(icon: Icon(Icons.build), label: 'Repair'),
          BottomNavigationBarItem(
            icon: Stack(
              children: [
                const Icon(Icons.inventory_2),
                if (_unreadCount > 0)
                  Positioned(
                    right: 0, top: 0,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                      constraints: const BoxConstraints(minWidth: 14, minHeight: 14),
                      child: Text(
                        '$_unreadCount',
                        style: const TextStyle(color: Colors.white, fontSize: 9),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            label: 'Parcel',
          ),
          const BottomNavigationBarItem(icon: Icon(Icons.person_add), label: 'Visitor'),
        ],
      ),
    );
  }

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
                          widget.userName.isNotEmpty ? widget.userName[0].toUpperCase() : '?',
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Welcome back,', style: TextStyle(color: Colors.white70, fontSize: 12)),
                          Text(
                            widget.userName,
                            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.notifications_outlined, color: Colors.white),
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
    final hasUnpaid = _totalUnpaid > 0;
    final amountStr = _totalUnpaid
        .toStringAsFixed(0)
        .replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},');

    return Container(
      margin: const EdgeInsets.only(top: 130, left: 24, right: 24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 5)),
        ],
      ),
      child: !_invoiceLoaded
          ? const SizedBox(
              height: 60,
              child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Outstanding Common Fee', style: TextStyle(color: Colors.grey)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: hasUnpaid ? Colors.red[50] : Colors.green[50],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            hasUnpaid ? Icons.error_outline : Icons.check_circle_outline,
                            size: 14,
                            color: hasUnpaid ? Colors.red : Colors.green,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            hasUnpaid ? 'Unpaid' : 'Paid',
                            style: TextStyle(
                              color: hasUnpaid ? Colors.red : Colors.green,
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
                Text(
                  hasUnpaid ? 'THB $amountStr' : 'THB 0',
                  style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.black87),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      hasUnpaid ? 'Due: $_dueDateStr' : 'ไม่มียอดค้างชำระ',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                    TextButton(
                      onPressed: () => setState(() => _selectedIndex = 1),
                      child: const Row(
                        children: [
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
          const Text('Quick Actions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildActionButton(Icons.payment, 'Pay Fee', Colors.blue, 1),
              _buildActionButton(Icons.build_rounded, 'Repair', Colors.orange, 2),
              _buildActionButton(Icons.inventory_2_rounded, 'Parcel', Colors.green, 3),
              _buildActionButton(Icons.person_add_rounded, 'Visitor', Colors.teal, 4),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label, Color color, int targetIndex) {
    return GestureDetector(
      onTap: () => setState(() => _selectedIndex = targetIndex),
      child: Column(
        children: [
          Container(
            width: 60, height: 60,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildUnitInfo() {
    final roomDisplay = widget.roomNumber.isNotEmpty
        ? 'Unit ${widget.roomNumber}'
        : 'Unit -';
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
                const Text('Your Unit', style: TextStyle(color: Colors.grey, fontSize: 12)),
                const SizedBox(height: 4),
                Text(roomDisplay, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(20)),
              child: Text(
                widget.userRole,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black54),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImportantSchedule() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('กำหนดการสำคัญ', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              TextButton(onPressed: () {}, child: const Text('ดูปฏิทิน')),
            ],
          ),
          const SizedBox(height: 8),
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

  Widget _buildScheduleItem(String title, String time, String location, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade100),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
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
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(icon, size: 18, color: color),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.access_time, size: 14, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(time, style: const TextStyle(color: Colors.black87, fontSize: 12)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 14, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(location, style: const TextStyle(color: Colors.grey, fontSize: 12)),
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
}
