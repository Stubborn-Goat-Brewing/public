"use client"

export function HoursCard() {
  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const today = new Date().getDay()
    return days[today]
  }

  const currentDay = getCurrentDay()

  const hours = [
    { day: "Sunday", time: "10:30am - 6:30pm" },
    { day: "Monday", time: "Closed" },
    { day: "Tuesday", time: "4pm - 10pm" },
    { day: "Wednesday", time: "4pm - 10pm" },
    { day: "Thursday", time: "4pm - 10pm" },
    { day: "Friday", time: "3pm - 11pm" },
    { day: "Saturday", time: "12pm - 11pm" },
  ]

  return (
    <div className="space-y-3 md:space-y-4 w-full">
      {hours.map((item) => (
        <div
          key={item.day}
          className={`flex justify-between py-2 px-3 md:px-4 rounded-md transition-colors text-sm md:text-base lg:text-lg ${
            item.day === currentDay
              ? "bg-amber-100 border border-amber-300 font-semibold text-amber-900"
              : "text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <span className="flex-shrink-0">{item.day}:</span>
          <span className={`ml-4 md:ml-8 ${item.time === "Closed" ? "text-red-600" : ""}`}>{item.time}</span>
        </div>
      ))}
      <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-border">
        <p className="text-xs md:text-sm text-muted-foreground text-center">
          * Kitchen closes one hour before posted closing time
        </p>
      </div>
    </div>
  )
}
