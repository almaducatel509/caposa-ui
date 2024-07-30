import React from "react";
export interface PropsLayout {
  children: React.ReactNode;
}

export interface Option {
  label: string;
  value: string;
}

interface Base {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  name: string;
  role: string;
  team: string;
  status: string;
  age: string;
  avatar: string;
  email: string;
}

export interface Member extends Base {
  memberId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  address: string;
  phoneNumber: string;
  accountType: string;
  accountNumber: string;
  currentBalance: number;
  securityInfo: string;
  preferences: string[];
  status: "active" | "desactive";
}
export interface Transaction extends Base {
  amount: number;
  date: Date;
  description: string;
  member_id: string;
  modele_trans: string;
}
export interface Loan extends Base {
  loanId: string;
  accountNumber: string;
  loanType: string;
  loanAmount: number;
  interestRate: number;
  loanDuration: string;
  paymentFrequency: string;
  dueDate: Date;
  guarantorAccountId: string;
  requestDate: Date;
  approvalDate: Date;
  disbursementDate: Date;
  //status: 'pending' | 'paid';
}
export interface Account extends Base {
  balance: number;
  member_id: string;
}
export interface Employee extends Base {
  employeeId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: string;
  address: string;
  transactionType: string;
  paymentRef: string;
}
export interface Payment extends Base {
  paymentId: string;
  paymentRef: string;
  accountId: string;
  transactionId: string;
  member?: Member;
}
export interface Branch {
  branchId: string;
  branchName: string;
  branchAddress: string;
  branchPhoneNumber: string;
  branchEmail: string;
  branchManagerId: string;
  branchCode: string;
  numberOfPosts: number;
  numberOfTellers: number;
  numberOfClerks: number;
  numberOfCreditOfficers: number;
  openingDate: Date;
}
export interface Analysis extends Base {
  analysisId: string;
  transactionId: string;
  memberId: string;
  accountId: string;
  branchId: string;
  employeeId: string;
  analysisDate: Date;
  analysisTime: string;
  analysisAmount: number;
  transactionType: string;
  description: string;
  balance: number;
  category: string;
  status: string;
  authorizationCode: string;
  comments: string;
}
export interface Treasury extends Base {
  accountNumber: string;
  memberId: string;
  branchId: string;
  loanId: string;
  employeeId: string;
}
export interface Report extends Base {
  reportId: string;
  transactionId: string;
  memberId: string;
  accountId: string;
  branchId: string;
  employeeId: string;
  reportStartDate: Date;
  reportEndDate: Date;
  transactionType: string;
  description: string;
  balance: number;
  status: string;
  authorizationCode: string;
  comments: string;
}

export const color = "success";
