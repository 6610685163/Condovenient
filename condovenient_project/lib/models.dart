class Invoice {
  final String id;
  final double amount;
  final String dueDate;
  final String status; // 'Pending' หรือ 'Paid'

  Invoice({
    required this.id,
    required this.amount,
    required this.dueDate,
    required this.status,
  });

  // แปลงจาก JSON ที่ได้จาก Backend
  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      dueDate: json['dueDate'] ?? '',
      status: json['status'] ?? 'pending',
    );
  }
}

class RepairTicket {
  final String id;
  final String userId;
  final String roomNumber;
  final String title;
  final String description;
  final String category;
  final String priority;
  final String status; // 'pending', 'assigned', 'completed'
  final String? technicianName;

  RepairTicket({
    required this.id,
    required this.userId,
    required this.roomNumber,
    required this.title,
    required this.description,
    required this.category,
    required this.priority,
    required this.status,
    this.technicianName,
  });

  factory RepairTicket.fromJson(Map<String, dynamic> json) {
    return RepairTicket(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      roomNumber: json['roomNumber'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      priority: json['priority'] ?? 'normal',
      status: json['status'] ?? 'pending',
      technicianName: json['technicianName'],
    );
  }
}

class AppNotification {
  final String id;
  final String userId;
  final String title;
  final String message;
  final String type; // 'payment', 'repair', 'general'
  final bool isRead;

  AppNotification({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? 'general',
      isRead: json['isRead'] ?? false,
    );
  }
}

class Receipt {
  final String id;
  final String paymentId;
  final double amount;
  final String transactionRef;
  final String status;

  Receipt({
    required this.id,
    required this.paymentId,
    required this.amount,
    required this.transactionRef,
    required this.status,
  });

  factory Receipt.fromJson(Map<String, dynamic> json) {
    return Receipt(
      id: json['id'] ?? '',
      paymentId: json['paymentId'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      transactionRef: json['transactionRef'] ?? '',
      status: json['status'] ?? 'issued',
    );
  }
}
