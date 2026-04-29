"use client";

import React from "react";
import { MapPin, Phone, Mail, Clock, Printer, CheckCircle } from "lucide-react";
import { BranchData, DAYS, OpeningHourDetail } from "./validations";
import { HAITI_DEPARTMENTS } from "@/app/data/haitiLocations";

interface BranchScheduleDisplayProps {
  branch: BranchData;
}

export default function BranchScheduleDisplay({ branch }: BranchScheduleDisplayProps) {
  const schedule = branch.opening_hour_details;
  const deptName = HAITI_DEPARTMENTS.find(d => d.code === branch.department_code)?.name ?? "N/A";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] px-6 py-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#DDEAD5] uppercase tracking-widest mb-1">
            {branch.branch_code}
          </p>
          <h3 className="text-xl font-bold text-white">{branch.branch_name}</h3>
          <p className="text-sm text-green-200 mt-0.5">{branch.city}, {deptName}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
            ${branch.status === "active" ? "bg-white/20 text-white" : "bg-white/10 text-green-300"}`}>
            <span className={`w-1.5 h-1.5 rounded-full
              ${branch.status === "active" ? "bg-[#81C784]" : "bg-gray-300"}`}
            />
            {branch.status === "active" ? "OUVERT" : "FERMÉ"}
          </span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                       bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer
          </button>
        </div>
      </div>

      {/* Success banner */}
      <div className="mx-6 mt-5 flex items-start gap-3 px-4 py-3 bg-[#DDEAD5] rounded-xl border border-[#2E7D32]/20">
        <CheckCircle className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#1B5E20]">Horaire régulier configuré</p>
          <p className="text-xs text-[#2E7D32] mt-0.5">
            Cette succursale possède un horaire régulier. Consultez les horaires ci-dessous.
          </p>
        </div>
      </div>

      {/* Contact info */}
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{branch.branch_address}</p>
            <p className="text-xs text-gray-400 mt-0.5">{branch.city}, Département {deptName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <a href={`tel:${branch.branch_phone_number}`}
             className="text-sm text-gray-700 hover:text-[#2E7D32] transition-colors font-medium">
            {branch.branch_phone_number}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#DDEAD5] flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <a href={`mailto:${branch.branch_email}`}
             className="text-sm text-gray-700 hover:text-[#2E7D32] transition-colors font-medium">
            {branch.branch_email}
          </a>
        </div>
      </div>

      {/* Schedule table */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-500" />
          <h4 className="font-bold text-gray-900">Horaires d'ouverture</h4>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-2 px-4 py-2 bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] rounded-t-xl border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Jour</p>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide text-right">Horaire</p>
        </div>

        <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 overflow-hidden">
          {DAYS.map(({ key, label }, i) => {
            const hours = schedule?.[key as keyof OpeningHourDetail] as string | null | undefined;
            return (
              <div
                key={key}
                className={`grid grid-cols-2 px-4 py-3 items-center hover:bg-[#DDEAD5]/20 transition-colors
                  ${i !== DAYS.length - 1 ? "border-b border-gray-100" : ""}
                  ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}
              >
                <span className="text-sm font-semibold text-gray-700">{label}</span>
                <div className="flex justify-end">
                  {hours ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold
                                     bg-[#DDEAD5] text-[#1B5E20] border border-[#2E7D32]/20">
                      {hours}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Fermé</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}