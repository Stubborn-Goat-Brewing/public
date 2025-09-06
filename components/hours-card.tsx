"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function HoursCard() {
  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const today = new Date().getDay()
    return days[today]
  }

  const currentDay = getCurrentDay()

  const hours = [
    { day: "Sunday", time: "12pm - 9pm" },
    { day: "Monday", time: "Closed" },
    { day: "Tuesday", time: "4pm - 10pm" },
    { day: "Wednesday", time: "4pm - 10pm" },
    { day: "Thursday", time: "4pm - 10pm" },
    { day: "Friday", time: "12pm - 11pm" },
    { day: "Saturday", time: "12pm - 11pm" },
  ]

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold">Hours of Operation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-8">
          {hours.map((item) => (
            <div
              key={item.day}
              className={`flex justify-between py-2 px-6 rounded-md transition-colors min-w-0 ${
                item.day === currentDay
                  ? "bg-amber-100 border border-amber-300 font-semibold text-amber-900"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <span className="flex-shrink-0">{item.day}:</span>
              <span className={`ml-8 ${item.time === "Closed" ? "text-red-600" : ""}`}>{item.time}</span>
            </div>
          ))}
          <div className="pt-4 mt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              * Kitchen closes one hour before posted closing time
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
