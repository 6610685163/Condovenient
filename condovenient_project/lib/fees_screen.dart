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

  double get _totalUnpaid => _invoices
      .where((inv) => inv['status'] == 'pending')
      .fold(0.0, (sum, inv) => sum + ((inv['amount'] ?? 0) as num).toDouble());
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
          _errorMessage = 'ไม่สามารถโหลดข้อมูล Invoice ได้';
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
      ).showSnackBar(const SnackBar(content: Text('ไม่มียอดค้างชำระ')));
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
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        title: const Text(
          'ชำระค่าส่วนกลาง',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        backgroundColor: const Color(0xFF1E1E1E),
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.amber),
            onPressed: _isLoading ? null : _loadInvoices,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : RefreshIndicator(
              onRefresh: _loadInvoices,
              color: Colors.amber,
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
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.redAccent),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.wifi_off,
                              color: Colors.redAccent,
                              size: 18,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(
                                  color: Colors.redAccent,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: _totalUnpaid > 0
                              ? [Colors.amber[600]!, Colors.amber[400]!]
                              : [Colors.green[600]!, Colors.green[400]!],
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color:
                                (_totalUnpaid > 0 ? Colors.amber : Colors.green)
                                    .withOpacity(0.2),
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
                                  color: Colors.black87,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.black,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  _totalUnpaid > 0 ? 'Unpaid' : 'Paid ✓',
                                  style: TextStyle(
                                    color: _totalUnpaid > 0
                                        ? Colors.amber
                                        : Colors.greenAccent,
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
                              color: Colors.black,
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
                                      color: Colors.black54,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
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
                                      color: Colors.black,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              if (_totalUnpaid > 0)
                                ElevatedButton(
                                  onPressed: _showPaymentGateway,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.black,
                                    foregroundColor: Colors.amber,
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
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 16),
                    if (_invoices.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(32),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E1E1E),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFF2A2A2A)),
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
        color: const Color(0xFF1E1E1E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A2A2A)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isPaid
                  ? Colors.greenAccent.withOpacity(0.1)
                  : Colors.amber.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.receipt_long,
              color: isPaid ? Colors.greenAccent : Colors.amber,
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
                    color: Colors.white,
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
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                isPaid ? 'ชำระแล้ว' : 'ค้างชำระ',
                style: TextStyle(
                  color: isPaid ? Colors.greenAccent : Colors.redAccent,
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

  String get _amountFormatted => widget.amount
      .toStringAsFixed(2)
      .replaceAllMapped(
        RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
        (m) => '${m[1]},',
      );

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

      if (paymentResponse.statusCode != 201)
        throw Exception('ไม่สามารถบันทึกการชำระเงินได้');
      final paymentData = jsonDecode(paymentResponse.body);
      final verifyResponse = await http
          .post(
            Uri.parse(
              '${widget.backendUrl}/api/payment/verify/${paymentData['paymentId']}',
            ),
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
            backgroundColor: const Color(0xFF1E1E1E),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: const BorderSide(color: Color(0xFF2A2A2A)),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle, color: Colors.amber, size: 64),
                const SizedBox(height: 16),
                const Text(
                  'ชำระเงินสำเร็จ',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'ระบบได้รับยอดเงิน ฿$_amountFormatted แล้ว',
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
                      backgroundColor: Colors.amber,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      'กลับสู่หน้าหลัก',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      } else {
        setState(
          () => _errorMsg = verifyData['message'] ?? 'การชำระเงินไม่สำเร็จ',
        );
      }
    } catch (e) {
      if (mounted)
        setState(() {
          _isProcessing = false;
          _errorMsg = 'เกิดข้อผิดพลาด: $e';
        });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Color(0xFF1E1E1E),
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
                color: Colors.grey[800],
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'เลือกช่องทางการชำระเงิน',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 20),
          _buildMethodTile(
            0,
            Icons.qr_code_scanner,
            Colors.amber,
            'สแกน QR PromptPay',
          ),
          const SizedBox(height: 12),
          _buildMethodTile(
            1,
            Icons.credit_card,
            Colors.amber,
            'บัตรเครดิต / เดบิต',
          ),
          if (_errorMsg != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.redAccent),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.error_outline,
                    color: Colors.redAccent,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _errorMsg!,
                      style: const TextStyle(
                        color: Colors.redAccent,
                        fontSize: 13,
                      ),
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
                      color: Colors.amber,
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
                    backgroundColor: Colors.amber,
                    foregroundColor: Colors.black,
                    disabledBackgroundColor: Colors.grey[800],
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: _isProcessing
                      ? const CircularProgressIndicator(color: Colors.black)
                      : const Text(
                          'ยืนยันชำระเงิน',
                          style: TextStyle(fontWeight: FontWeight.bold),
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
            color: isSelected ? Colors.amber : const Color(0xFF2A2A2A),
            width: 2,
          ),
          borderRadius: BorderRadius.circular(16),
          color: isSelected
              ? Colors.amber.withOpacity(0.05)
              : const Color(0xFF121212),
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
                  color: Colors.white,
                ),
              ),
            ),
            if (isSelected) const Icon(Icons.check_circle, color: Colors.amber),
          ],
        ),
      ),
    );
  }
}
