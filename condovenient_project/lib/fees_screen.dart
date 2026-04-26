import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class FeesScreen extends StatefulWidget {
  final String userId;
  final String roomId;

  const FeesScreen({super.key, this.userId = '', this.roomId = ''});

  @override
  State<FeesScreen> createState() => _FeesScreenState();
}

class _FeesScreenState extends State<FeesScreen> {
  final String _backendUrl = 'http://10.0.2.2:3000';
  List<Map<String, dynamic>> _invoices = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadInvoices();
  }

  // โหลดรายการ Invoice จาก Backend
  Future<void> _loadInvoices() async {
    if (widget.userId.isEmpty) {
      setState(() => _isLoading = false);
      return;
    }
    try {
      final response = await http.get(
        Uri.parse('$_backendUrl/api/payment/invoices/${widget.userId}'),
        headers: {'Content-Type': 'application/json'},
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _invoices = List<Map<String, dynamic>>.from(data['invoices'] ?? []);
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  // ฟังก์ชันจำลองการกดจ่ายเงิน (เด้ง Bottom Sheet ขึ้นมา)
  void _showPaymentGateway() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PaymentGatewaySheet(
        backendUrl: _backendUrl,
        roomId: widget.roomId,
        userId: widget.userId,
        onPaymentSuccess: _loadInvoices, // Refresh Invoice หลังจ่ายเงิน
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: const Text(
          'ชำระค่าส่วนกลาง',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // --- 1. การ์ดยอดค้างชำระ (Outstanding Balance) ---
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Colors.blue[700]!, Colors.blue[500]!],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.blue.withOpacity(0.3),
                          blurRadius: 15,
                          offset: const Offset(0, 8),
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
                              'ยอดค้างชำระรวม',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 14,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.redAccent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                'Unpaid',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          '฿ 5,250.00',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  'ครบกำหนดชำระ',
                                  style: TextStyle(
                                    color: Colors.white70,
                                    fontSize: 12,
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  '15 ก.พ. 2026',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                            ElevatedButton(
                              onPressed: _showPaymentGateway,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: Colors.blue[700],
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                  vertical: 12,
                                ),
                              ),
                              child: const Text(
                                'ชำระเงิน',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // --- 2. ประวัติการชำระเงิน (Invoice History) ---
                  const Text(
                    'ประวัติการชำระเงิน',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),

                  // แสดงข้อมูลจาก Backend ถ้ามี หรือแสดงข้อมูลจำลองถ้าไม่มี
                  if (_invoices.isNotEmpty)
                    ..._invoices.map(
                      (inv) => _buildInvoiceItem(
                        inv['description'] ?? 'ค่าส่วนกลาง',
                        inv['dueDate'] ?? '',
                        (inv['amount'] ?? 0).toString(),
                        inv['status'] == 'paid',
                      ),
                    )
                  else ...[
                    _buildInvoiceItem(
                      'ค่าส่วนกลาง เดือน ม.ค. 2026',
                      '15 ม.ค. 2026',
                      '5,250.00',
                      true,
                    ),
                    _buildInvoiceItem(
                      'ค่าส่วนกลาง เดือน ธ.ค. 2025',
                      '15 ธ.ค. 2025',
                      '5,250.00',
                      true,
                    ),
                    _buildInvoiceItem(
                      'ค่าที่จอดรถเพิ่มเติม (พ.ย.)',
                      '02 พ.ย. 2025',
                      '1,000.00',
                      true,
                    ),
                  ],
                ],
              ),
            ),
    );
  }

  Widget _buildInvoiceItem(
    String title,
    String date,
    String amount,
    bool isPaid,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green[50],
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.receipt_long, color: Colors.green[600]),
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
                  date,
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '฿ $amount',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                isPaid ? 'Paid' : 'Unpaid',
                style: TextStyle(
                  color: isPaid ? Colors.green : Colors.red,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// --- Widget สำหรับแสดงหน้าต่างจำลอง Payment Gateway ด้านล่าง ---
// ============================================================================
class PaymentGatewaySheet extends StatefulWidget {
  final String backendUrl;
  final String roomId;
  final String userId;
  final VoidCallback? onPaymentSuccess;

  const PaymentGatewaySheet({
    super.key,
    required this.backendUrl,
    this.roomId = '',
    this.userId = '',
    this.onPaymentSuccess,
  });

  @override
  State<PaymentGatewaySheet> createState() => _PaymentGatewaySheetState();
}

class _PaymentGatewaySheetState extends State<PaymentGatewaySheet> {
  int _selectedMethod = 0; // 0 = QR, 1 = Credit Card
  bool _isProcessing = false;

  void _processPayment() async {
    setState(() => _isProcessing = true);

    try {
      // 1. บันทึกการชำระเงินไปที่ Backend
      final paymentResponse = await http.post(
        Uri.parse('${widget.backendUrl}/api/payment/pay-common-fee'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'roomId': widget.roomId,
          'amount': 5250.00,
          'paymentMethod': _selectedMethod == 0
              ? 'qr_promptpay'
              : 'credit_card',
          'slipUrl': '',
        }),
      );

      if (paymentResponse.statusCode != 201) {
        throw Exception('ไม่สามารถบันทึกการชำระเงินได้');
      }

      final paymentData = jsonDecode(paymentResponse.body);
      final String paymentId = paymentData['paymentId'];

      // 2. เรียก Bank API Verification ผ่าน Backend
      final verifyResponse = await http.post(
        Uri.parse('${widget.backendUrl}/api/payment/verify/$paymentId'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'invoiceId': ''}),
      );

      final verifyData = jsonDecode(verifyResponse.body);

      if (mounted) {
        setState(() => _isProcessing = false);
        Navigator.pop(context); // ปิดหน้าต่าง Payment

        // โชว์ Pop-up จ่ายเงินสำเร็จ
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 64),
                const SizedBox(height: 16),
                const Text(
                  'ชำระเงินสำเร็จ',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  verifyData['receiptId'] != null
                      ? 'ระบบได้รับยอดเงิน ฿ 5,250.00 แล้ว\nใบเสร็จ #${verifyData['receiptId']}'
                      : 'ระบบได้รับยอดเงิน ฿ 5,250.00 แล้ว\nใบเสร็จถูกส่งไปยังอีเมลของคุณ',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      widget.onPaymentSuccess?.call(); // Refresh Invoice list
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue[700],
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      'กลับสู่หน้าหลัก',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isProcessing = false);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('เกิดข้อผิดพลาด: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 5,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'เลือกช่องทางการชำระเงิน',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),

          // ปุ่มเลือก QR Code
          GestureDetector(
            onTap: () => setState(() => _selectedMethod = 0),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(
                  color: _selectedMethod == 0
                      ? Colors.blue
                      : Colors.grey.shade300,
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(16),
                color: _selectedMethod == 0 ? Colors.blue[50] : Colors.white,
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.qr_code_scanner,
                    size: 32,
                    color: Colors.blue,
                  ),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Text(
                      'สแกน QR PromptPay',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  if (_selectedMethod == 0)
                    const Icon(Icons.check_circle, color: Colors.blue),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // ปุ่มเลือก Credit Card
          GestureDetector(
            onTap: () => setState(() => _selectedMethod = 1),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border.all(
                  color: _selectedMethod == 1
                      ? Colors.blue
                      : Colors.grey.shade300,
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(16),
                color: _selectedMethod == 1 ? Colors.blue[50] : Colors.white,
              ),
              child: Row(
                children: [
                  const Icon(Icons.credit_card, size: 32, color: Colors.orange),
                  const SizedBox(width: 16),
                  const Expanded(
                    child: Text(
                      'บัตรเครดิต / เดบิต',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  if (_selectedMethod == 1)
                    const Icon(Icons.check_circle, color: Colors.blue),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),

          // ยอดรวม และปุ่มยืนยัน
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'ยอดที่ต้องชำระ',
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                  Text(
                    '฿ 5,250.00',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              SizedBox(
                width: 150,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isProcessing ? null : _processPayment,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[700],
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: _isProcessing
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text(
                          'ยืนยันชำระเงิน',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20), // เผื่อขอบจอด้านล่าง (Safe Area)
        ],
      ),
    );
  }
}
