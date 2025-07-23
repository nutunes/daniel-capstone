
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const InstrumentAmountSelector = ({setInstrumentAmount, instrument}) => {

    return (
        <div className='flex flex-col gap-2 items-center'>
            <p className='font-fredoka text-md'>{instrument}</p>
            <Select defaultValue={1} onValueChange={(value)=>setInstrumentAmount(value)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={`How much ${instrument}?`} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectLabel>Fruits</SelectLabel>
                    <SelectItem value={0}>Less</SelectItem>
                    <SelectItem value={1}>Indifferent</SelectItem>
                    <SelectItem value={2}>Extra</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}

export default InstrumentAmountSelector