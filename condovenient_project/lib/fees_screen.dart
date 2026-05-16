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
  String? _errorMessage;

  double get _totalUnpaid {
    return _invoices
        .where((inv) => inv['status'] == 'pending')
        .fold(
          0.0,
          (sum, inv) => sum + ((inv['amount'] ?? 0) as num).toDouble(),
        );
  }

  Map<String, dynamic>? get _latestUnpaidInvoice {
    final unpaid = _invoices
        .where((inv) => inv['status'] == 'pending')
        .toList();
    return unpaid.isNotEmpty ? unpaid.first : null;
  }

  @override
  void initState() {
    super.initState();
    _loadInvoices();
  }

  Future<void> _loadInvoices() async {
    if (widget.userId.isEmpty) {
      setState(() => _isLoading = false);
      return;
    }
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final response = await http
          .get(
            Uri.parse('$_backendUrl/api/payment/invoices/${widget.userId}'),
            headers: {'Content-Type': 'application/json'},
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _invoices = List<Map<String, dynamic>>.from(data['invoices'] ?? []);
          _isLoading = false;
        });
      } else {
        setState(() {
          _isLoading = false;
          _errorMessage =
              'ไม่สามารถโหลดข้อมูล Invoice ได้ (${response.statusCode})';
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
      });
    }
  }

  void _showPaymentGateway() {
    if (_latestUnpaidInvoice == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('ไม่มียอดค้างชำระในขณะนี้')));
      return;
    }
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => PaymentGatewaySheet(
        backendUrl: _backendUrl,
        roomId: widget.roomId,
        userId: widget.userId,
        invoiceId: _latestUnpaidInvoice!['id'] ?? '',
        amount: _totalUnpaid,
        onPaymentSuccess: _loadInvoices,
      ),
    );
  }

  String _formatDueDate(String? dueDate) {
    if (dueDate == null || dueDate.isEmpty) return '-';
    try {
      final dt = DateTime.tryParse(dueDate);
      if (dt != null) {
        const thaiMonths = [
          '',
          'ม.ค.',
          'ก.พ.',
          'มี.ค.',
          'เม.ย.',
          'พ.ค.',
          'มิ.ย.',
          'ก.ค.',
          'ส.ค.',
          'ก.ย.',
          'ต.ค.',
          'พ.ย.',
          'ธ.ค.',
        ];
        return '${dt.day} ${thaiMonths[dt.month]} ${dt.year + 543}';
      }
    } catch (_) {}
    return dueDate;
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
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _isLoading ? null : _loadInvoices,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadInvoices,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_errorMessage != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.orange[50],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.orange[200]!),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.wifi_off,
                              color: Colors.orange,
                              size: 18,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(
                                  color: Colors.orange,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                    // การ์ดยอดค้างชำระ
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: _totalUnpaid > 0
                              ? [Colors.blue[700]!, Colors.blue[500]!]
                              : [Colors.green[600]!, Colors.green[400]!],
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color:
                                (_totalUnpaid > 0 ? Colors.blue : Colors.green)
                                    .withOpacity(0.3),
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
                                  color: _totalUnpaid > 0
                                      ? Colors.redAccent
                                      : Colors.green[800],
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  _totalUnpaid > 0 ? 'Unpaid' : 'Paid ✓',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _totalUnpaid > 0
                                ? '฿ ${_totalUnpaid.toStringAsFixed(2).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}'
                                : '฿ 0.00',
                            style: const TextStyle(
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
                                children: [
                                  const Text(
                                    'ครบกำหนดชำระ',
                                    style: TextStyle(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    _latestUnpaidInvoice != null
                                        ? _formatDueDate(
                                            _latestUnpaidInvoice!['dueDate'],
                                          )
                                        : 'ไม่มียอดค้างชำระ',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              if (_totalUnpaid > 0)
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
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    const Text(
                      'ประวัติการชำระเงิน',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),

                    if (_invoices.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(32),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Column(
                          children: [
                            Icon(
                              Icons.receipt_long_outlined,
                              size: 48,
                              color: Colors.grey,
                            ),
                            SizedBox(height: 8),
                            Text(
                              'ยังไม่มีประวัติการชำระเงิน',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      )
                    else
                      ..._invoices.map((inv) {
                        final isPaid = inv['status'] == 'paid';
                        final amount = (inv['amount'] ?? 0 as num).toDouble();
                        return _buildInvoiceItem(
                          inv['description'] ?? 'ค่าส่วนกลาง',
                          _formatDueDate(inv['dueDate']),
                          amount.toStringAsFixed(2),
                          isPaid,
                        );
                      }),
                  ],
                ),
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
              color: isPaid ? Colors.green[50] : Colors.red[50],
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.receipt_long,
              color: isPaid ? Colors.green[600] : Colors.red[400],
            ),
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
                isPaid ? 'ชำระแล้ว' : 'ค้างชำระ',
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
class PaymentGatewaySheet extends StatefulWidget {
  final String backendUrl;
  final String roomId;
  final String userId;
  final String invoiceId;
  final double amount;
  final VoidCallback? onPaymentSuccess;

  const PaymentGatewaySheet({
    super.key,
    required this.backendUrl,
    this.roomId = '',
    this.userId = '',
    this.invoiceId = '',
    this.amount = 0,
    this.onPaymentSuccess,
  });

  @override
  State<PaymentGatewaySheet> createState() => _PaymentGatewaySheetState();
}

class _PaymentGatewaySheetState extends State<PaymentGatewaySheet> {
  int _selectedMethod = 0;
  bool _isProcessing = false;
  String? _errorMsg;

  String get _amountFormatted {
    return widget.amount
        .toStringAsFixed(2)
        .replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (m) => '${m[1]},',
        );
  }

  void _processPayment() async {
    setState(() {
      _isProcessing = true;
      _errorMsg = null;
    });

    try {
      final paymentResponse = await http
          .post(
            Uri.parse('${widget.backendUrl}/api/payment/pay-common-fee'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'roomId': widget.roomId,
              'userId': widget.userId,
              'amount': widget.amount,
              'paymentMethod': _selectedMethod == 0
                  ? 'qr_promptpay'
                  : 'credit_card',
              'slipUrl': '',
            }),
          )
          .timeout(const Duration(seconds: 15));

      if (paymentResponse.statusCode != 201) {
        throw Exception(
          'ไม่สามารถบันทึกการชำระเงินได้ (${paymentResponse.statusCode})',
        );
      }

      final paymentData = jsonDecode(paymentResponse.body);
      final String paymentId = paymentData['paymentId'];

      final verifyResponse = await http
          .post(
            Uri.parse('${widget.backendUrl}/api/payment/verify/$paymentId'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'invoiceId': widget.invoiceId}),
          )
          .timeout(const Duration(seconds: 15));

      final verifyData = jsonDecode(verifyResponse.body);

      if (!mounted) return;
      setState(() => _isProcessing = false);

      if (verifyData['success'] == true) {
        Navigator.pop(context);
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
                  'ระบบได้รับยอดเงิน ฿$_amountFormatted แล้ว\n'
                  '${verifyData['receiptId'] != null ? 'ใบเสร็จ #${verifyData['receiptId']}' : ''}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      widget.onPaymentSuccess?.call();
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
      } else {
        setState(() {
          _errorMsg =
              verifyData['message'] ?? 'การชำระเงินไม่สำเร็จ กรุณาลองใหม่';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _errorMsg = 'เกิดข้อผิดพลาด: $e';
        });
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

          _buildMethodTile(
            0,
            Icons.qr_code_scanner,
            Colors.blue,
            'สแกน QR PromptPay',
          ),
          const SizedBox(height: 12),
          _buildMethodTile(
            1,
            Icons.credit_card,
            Colors.orange,
            'บัตรเครดิต / เดบิต',
          ),

          if (_errorMsg != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red[50],
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.red[200]!),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _errorMsg!,
                      style: const TextStyle(color: Colors.red, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ยอดที่ต้องชำระ',
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                  Text(
                    '฿ $_amountFormatted',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
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
                    disabledBackgroundColor: Colors.grey[400],
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
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildMethodTile(int index, IconData icon, Color color, String label) {
    final isSelected = _selectedMethod == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = index),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? Colors.blue : Colors.grey.shade300,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(16),
          color: isSelected ? Colors.blue[50] : Colors.white,
        ),
        child: Row(
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
            ),
            if (isSelected) const Icon(Icons.check_circle, color: Colors.blue),
          ],
        ),
      ),
    );
  }
}
