class AdminOverviewStats {
  final int totalUsers;
  final int trialUsers;
  final int activeUsers;
  final int expiredUsers;
  final int blockedUsers;
  final int totalMachines;
  final int totalRentals;
  final double totalTurnover;
  final double totalPaid;
  final double totalPending;

  AdminOverviewStats({
    required this.totalUsers,
    required this.trialUsers,
    required this.activeUsers,
    required this.expiredUsers,
    required this.blockedUsers,
    required this.totalMachines,
    required this.totalRentals,
    required this.totalTurnover,
    required this.totalPaid,
    required this.totalPending,
  });

  factory AdminOverviewStats.fromJson(Map<String, dynamic> json) {
    return AdminOverviewStats(
      totalUsers: json['totalUsers'] ?? 0,
      trialUsers: json['trialUsers'] ?? 0,
      activeUsers: json['activeUsers'] ?? 0,
      expiredUsers: json['expiredUsers'] ?? 0,
      blockedUsers: json['blockedUsers'] ?? 0,
      totalMachines: json['totalMachines'] ?? 0,
      totalRentals: json['totalRentals'] ?? 0,
      totalTurnover: (json['totalTurnover'] ?? 0).toDouble(),
      totalPaid: (json['totalPaid'] ?? 0).toDouble(),
      totalPending: (json['totalPending'] ?? 0).toDouble(),
    );
  }
}

class AdminUserItem {
  final String id;
  final String uid;
  final String username;
  final String mobileNo;
  final String email;
  final String companyName;
  final String subscriptionStatus;
  final String subscriptionPlan;
  final int daysLeft;
  final bool isBlocked;
  final String blockReason;
  final int machineCount;
  final int rentalCount;
  final DateTime? createdAt;
  final DateTime? subscriptionEndsAt;

  AdminUserItem({
    required this.id,
    required this.uid,
    required this.username,
    required this.mobileNo,
    required this.email,
    required this.companyName,
    required this.subscriptionStatus,
    required this.subscriptionPlan,
    required this.daysLeft,
    required this.isBlocked,
    required this.blockReason,
    required this.machineCount,
    required this.rentalCount,
    this.createdAt,
    this.subscriptionEndsAt,
  });

  factory AdminUserItem.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic d) {
      if (d == null) return null;
      try {
        return DateTime.parse(d.toString());
      } catch (_) {
        return null;
      }
    }

    return AdminUserItem(
      id: json['_id'] ?? '',
      uid: json['uid'] ?? '',
      username: json['username'] ?? 'No Name',
      mobileNo: json['mobileNo'] ?? '',
      email: json['email'] ?? '',
      companyName: json['companyName'] ?? '',
      subscriptionStatus: json['subscriptionStatus'] ?? 'trial',
      subscriptionPlan: json['subscriptionPlan'] ?? 'free_trial',
      daysLeft: json['daysLeft'] ?? 0,
      isBlocked: json['isBlocked'] ?? false,
      blockReason: json['blockReason'] ?? '',
      machineCount: json['machineCount'] ?? 0,
      rentalCount: json['rentalCount'] ?? 0,
      createdAt: parseDate(json['createdAt']),
      subscriptionEndsAt: parseDate(json['subscriptionEndsAt']),
    );
  }
}
